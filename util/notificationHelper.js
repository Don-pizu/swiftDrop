// utils/notificationHelper.js


const { queueNotification } = require('../controllers/notificationController');

/*
{Object} ride - Ride document (with user & driver populated)
 {String} status - The current ride status (e.g., 'completed', 'assigned')
 */


const rideNotification = async (ride, status) => {
  try {
    if (!ride || !status) return;

    // Define which channels to use for each ride status
    const channelsByStatus = {
      requested: ['push', 'sms'],
      assigned: ['push', 'sms'],
      accepted: ['push', 'sms'],
      rider_arrived: ['push', 'sms'],
      driver_arrived: ['push', 'sms'],
      in_progress: ['push'],
      completed: ['push',   'email', 'sms'],
      cancelled: ['push', 'sms'],
    };

    // Define notification message templates per status
    const messages = {
      requested: {
        title: 'Ride Requested',
        body: 'Your ride request has been received. Searching for a driver...',
      },
      assigned: {
        title: 'Driver Assigned',
        body: `${ride.driver?.fullname || 'Your driver'} is on the way.`,
      },
      accepted: {                      
      title: 'Ride Accepted',
        body: `${ride.driver?.fullname || 'A driver'} has accepted your ride.`,
      },
      rider_arrived: {
        title: 'Rider Arrived',
        body: `${ride.driver?.fullname || 'Your rider'} has arrived.`,
      },
      driver_arrived: {
        title: 'Driver Arrived',
        body: `${ride.driver?.fullname || 'Your driver'} has arrived.`,
      },
      in_progress: {
        title: 'Trip In Progress',
        body: 'Your ride has started. Sit back and enjoy your trip!',
      },
      completed: {
        title: 'Trip Completed',
        body: `Your trip is complete. Total fare: ₦${ride.fare || 0}`,
      },
      cancelled: {
        title: 'Ride Cancelled',
        body: 'Your ride has been cancelled.',
      },
    };

    // Select proper message & channels
    const msg = messages[status];
    const channels = channelsByStatus[status] || ['push'];

    if (!msg) return; // Skip unknown statuses

    // Queue notification for delivery
    await queueNotification(ride.user._id, channels, status, {
      title: msg.title,
      body: msg.body,
      to: ride.user.email,
      phone: ride.user.phoneNumber,
      fcmToken: ride.user.fcmToken,
      rideId: ride._id,
    });
  } catch (err) {
    console.error('Error sending ride notification:', err);
  }
};

module.exports = { rideNotification };
