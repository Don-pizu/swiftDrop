//controller/driverController.js
//controller for rider and driver that want to convey products/passenger

const User = require('../models/User');
const Driver = require('../models/driver');


//POST  Create rider/driver profile (linked to User)
exports.createDriverProfile = async (req, res, next) => {
	try {

		const userId = req.user._id;
		const { status, vehicleType, location  } = req.body;

		// check if user has proper role
	    if (!['rider', 'driver'].includes(req.user.role)) {
	      return res.status(403).json({ message: 'Only riders or drivers can create a profile' });
	    }

		//validate existing rider/driver
		const existing = await Driver.findOne({ user: userId })
													.populate('user');
	    if (existing) 
	    	return res.status(400).json({ message: 'Profile already exists' });

	    // Handle string location (like "Lagos") properly
	    let geoLocation = {
	      type: 'Point',
	      coordinates: [0, 0], // default until you add geocoding
	    };

	    if (typeof location === 'string') {
	      geoLocation.description = location;
	    } else if (location && location.lng && location.lat) {
	      geoLocation.coordinates = [parseFloat(location.lng), parseFloat(location.lat)];
	      geoLocation.description = location.description || '';
	    }

      	//restrict which vehicleType can set by role
      	const riderType = ['bike'];
      	const driverType = ['car', 'truck', 'van'];

      	if(req.user.role === 'rider' && !riderType.includes(vehicleType))
      		return res.status(400).json({ message: `Riders can only set vehicleType as 'bike'. You entered '${vehicleType}'.`});

      	if(req.user.role === 'driver' && !driverType.includes(vehicleType))
      		return res.status(400).json({ message: `Drivers can only set vehicleType as 'car', 'truck', or 'van'. You entered '${vehicleType}'.`});


      	//restrict status to only allowed values
      	const allowedStatus = ['available', 'on-trip', 'offline'];
	    if (status && !allowedStatus.includes(status)) 
	      return res.status(400).json({ message: `Invalid status '${status}'. Allowed statuses are: ${allowedStatus.join(', ')}.` });
	    


      	// create driver/rider profile
	    const driver = await Driver.create({
	      user: userId,
	      status: status || 'available',
	      vehicleType: vehicleType || (req.user.role === 'rider' ? 'bike' : 'car'),
	      location: geoLocation,
	      role: req.user.role
	    });

	    //populate user details (like fullname, phoneNumber, role)
    const populatedDriver = await Driver.findById(driver._id)
      .populate('user', 'fullname phoneNumber role');

	    res.status(201).json(populatedDriver);

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//GET get driver by id
exports.getDriver = async ( req, res, next ) => {
	try {

		const driver = await Driver.findById(req.params.id);

		if(!driver)
			return res.status(404).json({ message: 'Driver not found'});

		res.json(driver);

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//GET Get all drivers
exports.getAllDrivers = async (req, res, next) => {
	try {
		const { page = 1, limit = 10, status, rating, totalTrips, location} = req.query;
		const query ={};

		if(status) query.status = status;
		if(rating) query.rating = rating;
		if(totalTrips) query.totalTrips = totalTrips; 
		if(location) query.location = location;

		const skip = (page - 1) * limit;

		const driver = await Driver.find(query)
										.populate('user', 'fullname phoneNumber role')
										.skip(skip)
										.limit(parseInt(limit))
										.sort({createdAt: -1});

		//count total driver
		const totalDriver = await Driver.countDocuments(query);

		//total pages
		const totalPages = Math.ceil ( totalDriver / limit );

		res.json({
			driver,
			pages: parseInt(page),
			totalPages,
			totalDriver
		});

	} catch (err){
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
}



//PUT   Update availability + live location
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status, lng, lat } = req.body;

    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) 
    	return res.status(404).json({ message: 'Profile not found' });

    //Restrict status to only allowed values BEFORE assigning
    const allowedStatus = ['available', 'on-trip', 'offline'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid status '${status}'. Allowed statuses are: ${allowedStatus.join(', ')}.`
      });
    }


    // Update status if valid
    if (status) 
    	driver.status = status;

    if (lng && lat) {
      driver.location = { type: 'Point', coordinates: [lng, lat] };
      driver.lastSeen = Date.now();
    }

    await driver.save();

    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};



// Find nearby riders/drivers (for testing / rider matching)
exports.findNearbyDrivers = async (req, res) => {
  try {
    const { lng, lat, role, maxDistance = 5000 } = req.query;     //maxDistance = 5000 means 5km

    // Validate coordinates
    if (!lng || !lat || isNaN(parseFloat(lng)) || isNaN(parseFloat(lat))) 
      return res.status(400).json({ message: 'Please provide valid lng and lat query parameters' });
    

    const drivers = await Driver.find({
      status: 'available',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
		.populate('user', 'fullname phoneNumber role')   //get user info
	    .limit(10);

	// filter by role if passed
    const filtered = role ? drivers.filter(d => d.user.role === role) : drivers;

    res.json(filtered);

  } catch (err) {
   res.status(500).json({ message: err.message || 'Internal server error' });
  }
};



//DELETE   Delete driver by id
exports.deleteDriver = async (req, res, next) => {
	try {

		const driver = await Driver.findById(req.params.id)
													.populate('user', 'role');

		if(!driver)
			return res.status(404).json({ message: 'Driver not found'});

		//delete driver
		await driver.deleteOne();

		res.status(200).json({ message: `${driver.user.role} deleted successfully` });


	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
}
