// util/driverPresence.js

// Track active driver/rider locations in Redis using GEO commands
const { connectionRedis } = require('./redis');

const DRIVER_LOCATION_KEY = 'active_drivers';

// Add or update driver location in Redis
exports.updateDriverLocation = async (driverId, lng, lat, status = 'available') => {
  try {
    if (status === 'available') {
      //Add or update driver location (geoadd)
      await connectionRedis.geoadd(DRIVER_LOCATION_KEY, lng, lat, driverId);
      await connectionRedis.hset(`driver_status:${driverId}`, { status, lng, lat, lastSeen: Date.now() });
    } else {
      // If offline or on-trip, remove from active list
      await connectionRedis.zrem(DRIVER_LOCATION_KEY, driverId);
      await connectionRedis.hset(`driver_status:${driverId}`, { status, lastSeen: Date.now() });
    }
    console.log(`✅ Updated driver ${driverId} → ${status} @ [${lng}, ${lat}]`);
  } catch (err) {
    console.error('❌ Redis updateDriverLocation failed:', err.message);
  }
};

// Find nearby drivers within a given radius (km)
exports.findNearbyDrivers = async (lng, lat, radius = 5) => {
  try {
    
    //Quickly find nearby drivers (georadius or geosearch)
    const drivers = await connectionRedis.geosearch(
      DRIVER_LOCATION_KEY,
      'FROMLONLAT', lng, lat,
      'BYRADIUS', radius, 'km',         // radius in kilometers
      'WITHCOORD',
      'COUNT', 20,
      'ASC'
    );

    return drivers.map(([driverId, [lon, lat]]) => ({
      driverId,
      location: { lng: parseFloat(lon), lat: parseFloat(lat) }
    }));
  } catch (err) {
    console.error('❌ Redis findNearbyDrivers failed:', err.message);
    return [];
  }
};

// Remove driver from Redis (when offline or deleted)
exports.removeDriver = async (driverId) => {
  try {
    //Remove driver when offline (zrem)
    await connectionRedis.zrem(DRIVER_LOCATION_KEY, driverId);
    await connectionRedis.del(`driver_status:${driverId}`);
    console.log(`🗑️ Removed driver ${driverId} from Redis`);
  } catch (err) {
    console.error('❌ Redis removeDriver failed:', err.message);
  }
};

// Get driver status (online/offline)
exports.getDriverStatus = async (driverId) => {
  try {
    const data = await connectionRedis.hgetall(`driver_status:${driverId}`);
    return data;
  } catch (err) {
    console.error('❌ Redis getDriverStatus failed:', err.message);
    return null;
  }
};
