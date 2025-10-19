//queues/notificationQueue.js
//use redis for this notification queue
//Enqueues notification jobs


const { Queue, QueueScheduler } = require('bullmq');
const { connectionRedis } = require('../util/redis');

//create a queue named notifications
const notificationQueue = new Queue('notifications', {  connection: connectionRedis });

console.log('✅ Notification queue initialized (BullMQ v4+)');

module.exports = notificationQueue;
