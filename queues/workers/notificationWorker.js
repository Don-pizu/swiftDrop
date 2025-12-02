//queues/workers/notificationWorker.js
//Processes queued jobs asynchronously

const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { connectionRedis } = require('../../util/redis');
const Notification = require('../../models/notification');
const { sendOtp } = require('../../util/otpService');         
const { sendPush } = require('../../controllers/pushController');       //check
const io = require('../../util/chatService');  
const { getSocketIdForUser } = require('../../util/socketMapping'); 



//  Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',            
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});




//create worker which listen to notification queue
const worker = new Worker(
  'notifications', 
  async (job) => {

    const { notificationId, channel, payload } = job.data;

    //check notification
    const notif = await Notification.findById(notificationId);
    if (!notif) 
      throw new Error('Notification record not found');

    //update notification status = processing if found
    await notif.updateOne({ status: 'processing' });

    try {
      if (channel === 'sms') {
        const res = await sendOtp({type: 'sms', payload});         // { phone, message }

        await notif.updateOne({ status: 'sent', sentAt: new Date() });

      } else if (channel === 'email') {
         await transporter.sendMail({
          from: '"SwiftDrop" <no-reply@swiftdrop.com>',
          to: payload.to,
          subject: payload.subject || notif.title,
          html: payload.html || `<p>${notif.body}</p>`
        });

      } else if (channel === 'push') {
        await sendPush(payload);                                 // { fcmToken, title, body, data }

        await notif.updateOne({ status: 'sent', sentAt: new Date() });
   
      } else if (channel === 'whatsapp') {
        await sendOtp({type: 'whatsapp', payload});

        await notif.updateOne({ status: 'sent', sentAt: new Date() });
      
      } else if (channel === 'in_app') {
        // Write to DB and emit socket to user
        await notif.updateOne({ status: 'sent', sentAt: new Date() });
      }

      // Emit Notification via WebSocket (if user is online)  
      try {
        const userSocketId = await getSocketIdForUser(notif.user.toString()); // implement mapping via Redis
        if (userSocketId) {
          io.to(userSocketId).emit('notification', {
            id: notif._id,
            type: notif.type,
            channel: notif.channel,
            title: notif.title,
            body: notif.body,
            payload: notif.payload
          });
        }
      } catch (e) {
        // non-fatal
        console.warn('socket emit failed', e.message);
      }

      return { success: true };
    } catch (err) {
       await notif.updateOne({
        status: 'failed',
        error: err.message,
        failedAt: new Date()
      });
      console.error('Notification worker failed:', err);
      throw err;
    }
  }, {
  connection: connectionRedis,
  concurrency: 5
  }
);

module.exports = worker;
