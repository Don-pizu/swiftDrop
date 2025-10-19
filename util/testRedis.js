require('dotenv').config();
const { connectionRedis } = require('./redis');

(async () => {
  try {
    const pong = await connectionRedis.ping();
    console.log('✅ Redis PING response:', pong);
    process.exit(0);
  } catch (err) {
    console.error('❌ Redis test failed:', err);
    process.exit(1);
  }
})();
