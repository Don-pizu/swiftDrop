//controllers/notificationController.js

const notificationQueue = require('../queues/notificationQueue');                // Redis Queue notification 
const Notification = require('../models/notification');                          //Schema for notification
const NotificationPreference = require('../models/notificationPreference');      //schema for notification preference
const User = require('../models/User'); 


//core notification queue helper
exports.queueNotification = async function (userId, channels = ['push','sms','email'], type, payload) {

  	//filter channels by user preference e.g sms, email, whatsapp
  	const prefs = await NotificationPreference.findOne({ user: userId });
  	if (prefs) {
    	channels = channels.filter(ch => prefs.channels[ch]);
  	}

  	const created = [];

  	//create notification for each channel of channels (notificationPreference) and queue job
  	for (const channel of channels) {

  		//create notification
    	const doc = await Notification.create({
      		user: userId,
      		channel,
      		type,
      		title: payload.title,
      		body: payload.body,
      		payload
    	});

    	const job = await notificationQueue.add('send', {
      		notificationId: doc._id.toString(),
      		channel,
      		payload
    	}, {
      		attempts: 3,
      		backoff: { type: 'exponential', delay: 3000 },
      		removeOnComplete: { age: 3600 },
      		removeOnFail: { age: 7 * 24 * 3600 }
    	}
    	);

    	await doc.updateOne({ jobId: job.id });
    	created.push(doc);
  	}
  	return created;
}


//Admin Broadcast (e.g. send promo / announcement)
exports.sendBroadcast = async (req, res) => {
	try {
		const { title, body } = req.body;
	  	const users = await User.find({}, '_id fcmToken email phone');

	  	await Promise.all(users.map(user =>
	    	exports.queueNotification(user._id, ['push', 'email'], 'broadcast', {
	      		title,
	      		body,
	      		fcmToken: user.fcmToken,
	      		to: user.email
	    	})
	  	));

	  	res.json({ message: 'Broadcast enqueued successfully' });
	  } catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};





//GET  Get all user notifications
exports.getUserNotifications = async (req, res) => {
	try{
		const notifications = await Notification.find({ user: req.user._id })
											    .sort({ createdAt: -1 })
											    .limit(50);

		if (!notifications)
			return res.status(404).json({ message: 'Notification is not found'});


		if (notifications.length === 0)
			return res.status(404).json({ message: 'There is no Notification'});

	  	res.json(notifications);
	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}  	
};



//UPDATE  update single notification as read
exports.markAsRead = async (req, res) => {
	try{
		const notif = await Notification.findOneAndUpdate(
	    	{ _id: req.params.id, user: req.user._id },
	    	{ read: true },
	    	{ new: true }
	  	);

	  	if (!notif) 
	  		return res.status(404).json({ message: 'Notification not found' });

	  	res.json(notif);
	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//UPDATE   mark all as read (all on read)
exports.markAllAsRead = async (req, res) => {
	try{
		await Notification.updateMany({ user: req.user._id, read: false }, { read: true });

  		res.json({ message: 'All notifications marked as read' });

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};



//DELETE Delete a notification
exports.deleteNotification = async (req, res) => {

  	try {
  		await Notification.deleteOne({ _id: req.params.id, user: req.user._id });
  	
  		res.json({ message: 'Notification deleted' });
  	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};



//Resend notification (manual retry) 
exports.resendNotification = async (req, res) => {
	try{
		const notif = await Notification.findById(req.params.id);
	  	if (!notif) 
	  		return res.status(404).json({ message: 'Notification not found' });

	  	await exports.queueNotification(notif.user, [notif.channel], notif.type, notif.payload);
	  	
	  	res.json({ message: 'Notification re-queued' });

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


