// controllers/pushController.js
// Handles sending push notifications via Firebase Cloud Messaging (FCM)

const admin = require('../config/firebase');


//Send a push notification
//payload - { fcmToken, title, body, data }

exports.sendPush = async (payload) => {
  try {
    const { fcmToken, title, body, data } = payload;

    if (!fcmToken) {
      throw new Error('Missing fcmToken for push notification');
    }

    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ) : {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Push notification failed:', error.message);
    throw new Error(error.message);
  }
};
