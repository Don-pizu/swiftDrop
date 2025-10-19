// util/socketMapping.js
// Handles mapping between userId ↔ socketId using Redis

const { connectionRedis } = require('./redis');

// Keys will be stored like:
// socket:user:{userId} -> socketId
// user:socket:{socketId} -> userId

// Save mapping when a user connects
async function setSocketForUser(userId, socketId) {
  if (!userId || !socketId) return;
  await connectionRedis.set(`socket:user:${userId}`, socketId);
  await connectionRedis.set(`user:socket:${socketId}`, userId);
}

// Get socketId of a user
async function getSocketIdForUser(userId) {
  if (!userId) return null;
  return await connectionRedis.get(`socket:user:${userId}`);
}

// Remove mapping when user disconnects
async function removeSocketMapping(socketId) {
  if (!socketId) return;
  const userId = await connectionRedis.get(`user:socket:${socketId}`);
  if (userId) {
    await connectionRedis.del(`socket:user:${userId}`);
  }
  await connectionRedis.del(`user:socket:${socketId}`);
}

module.exports = {
  setSocketForUser,
  getSocketIdForUser,
  removeSocketMapping
};
