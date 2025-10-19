//controllers/rideController.js
//controller for actual ride booking


const User = require ('../models/User');         //User schema
const Driver = require ('../models/driver');     //rider and driver schema
const Ride = require('../models/ride');          //ride booking schema
const { queueNotification } = require('./notificationController');      //notification controller
const { rideNotification } = require('../util/notificationHelper');



const parseCoords = (val) => {
  if (Array.isArray(val)) return val.map(Number);
  if (typeof val === 'string') return val.split(',').map(Number);
  throw new Error('Invalid coordinate format');
};


//POST   User request for a ride(by user)
exports.requestRide = async (req, res, next) => {
	try {

		const { serviceType, pickup, dropoff } = req.body;

		if(!pickup || !dropoff)
			return res.status(400).json({ message: 'Pick and Dropoff are required'});
		
		//Allowed only avaialble serviceType
		const allowedServiceType = ['passenger', 'delivery'];
		if(!serviceType || !allowedServiceType.includes(serviceType))
			return res.status(400).json({ message: `Invalid serviceType '${serviceType}'. Allowed serviceType are : ${allowedServiceType.join(', ')}` });


		const ride = await Ride.create({
			user: req.user._id,
			pickupLocation: { type: 'Point', coordinates: parseCoords(pickup) },
			dropoffLocation: { type: 'Point', coordinates: parseCoords(dropoff) },
			serviceType,
			status: 'requested'
		});


		///Ride notification based on ride.status (from notificationhelper)
	    if (ride.status) {
	    	await ride.populate('user', 'fullname email fcmToken phoneNumber');
			await ride.populate('driver', 'fullname');
		  	await rideNotification(ride, ride.status);
		}

		res.status(201).json({
			message: 'Ride request created',
			ride
		});

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//GET  get ride by id
exports.getRide = async (req, res, next) => {
	try {

		const ride = await Ride.findById(req.params.id)
						.populate('rider', 'fullname phoneNumber role')
      					.populate('driver', 'fullname phoneNumber role');

		if(!ride)
			return res.status(404).json({message: 'Ride not found'});

		res.json(ride);

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};



//GET Get all the rides
exports.getAllRides = async (req, res, next) => {
	try {

		const { page = 1, limit = 10, serviceType, status} = req.query;
		const query = {};

		if(serviceType) query.serviceType = serviceType;
		if(status) query.status = status;

		const skip = (page - 1) * limit;

		const ride = await Ride.find(query)
								.populate('rider', 'fullname phoneNumber role')
  								.populate('driver', 'fullname phoneNumber role')
								.skip(skip)
								.limit(parseInt(limit))
								.sort({createdAt: -1});

		//count total rides
		const totalRides = await Ride.countDocuments(query);

		//total pages
		const totalPages = Math.ceil( totalRides / limit );

		res.json({
			ride,
			pages: parseInt(page),
			totalPages,
			totalRides
		})


	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//DELETE   Cancel ride(by user)
exports.cancelRide = async (req, res, next) => {
	try {

		const ride = await Ride.findById(req.params.id); 
		if (!ride) 
			return res.status(404).json({ message: 'Ride not found' });

		//checking if user / driver is the one acessing to cancel ride
		if (
		  	ride.user.toString() !== req.user._id.toString() && 
		  	(!ride.driver || ride.driver.toString() !== req.user._id.toString())
		) {
		  return res.status(403).json({ message: 'Not authorized to cancel this ride' });
		}

      	//cancel ride
      	ride.status = 'cancelled';

      	await ride.save();

      	//Ride notification based on ride.status (from notificationhelper)
	    if (ride.status) {
	    	await ride.populate('user', 'fullname email fcmToken phoneNumber');
			await ride.populate('driver', 'fullname');
		  	await rideNotification(ride, ride.status);
		}

      	res.status(200).json({
      		message: 'Ride cancelled',
      		ride
      	})

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//Accept ride (by rider/driver)
exports.acceptRide = async ( req, res, next ) => {
	try {

		// find driver's profile
		const driver = await Driver.findOne({user: req.user._id});
		if (!driver) 
		 	return res.status(404).json({ message: 'Driver Profile not found' });

		// prevent accepting if already on a trip
	    if (driver.status === 'on-trip' && driver.currentRide) 
	      return res.status(400).json({ message: 'You already have an ongoing trip' });
	    
	    /*
	    //allowed only status = accepted
	    const allowedStatus = ['accepted'];
		if (!status || !allowedStatus.includes(status))
			return res.status(400).json({ message: `Invalid status '${status}'. Allowed statuses are: ${allowedStatus.join(', ')}.` });
		*/

		//fetch ride and update status
		const ride = await Ride.findOneAndUpdate(
	      { _id: req.params.id, status: 'requested', driver: { $exists: false } },   //driver: { $exists: false } make sure only 1 driver accept a ride
	      { driver: req.user._id, status: 'accepted' },
	      { new: true }
	    );

		//if ride taken or no ride available
	    if (!ride) 
	    	return res.status(400).json({ message: 'Ride is not available at the moment' });


	    //change driver status from offline/available to on-trip
	    driver.status = 'on-trip',
	    driver.currentRide = ride._id;
	    await driver.save();

	    ///Ride notification based on ride.status (from notificationhelper)
	    if (ride.status) {
	    	await ride.populate('user', 'fullname email fcmToken phoneNumber');
			await ride.populate('driver', 'fullname');
		  	await rideNotification(ride, ride.status);
		}
	
	    res.status(200).json({ 
	    	message: 'Ride accepted', 
	    	ride 
	    });

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};



//Update ride status(rider/driver actions)
exports.updateRideStatus = async (req, res, next) => {
	try {

		// allowed: rider_arrived, driver_arrived, in_progress, completed
		const { status } = req.body;

		//fetch ride
		const ride = await Ride.findById(req.params.id)
											.populate('user', 'fullname email role')
      										.populate('driver', 'fullname email role');

		if (!ride) 
			return res.status(404).json({ message: 'Ride not found' });

		// Identify current user’s role & link
    	const userRole = req.user.role;
    	const userId = req.user._id.toString();     

		//  Determine if current user is the requester or the driver
	    const isUser = ride.user && ride.user._id.toString() === userId;
	    const isDriver = ride.driver && ride.driver._id.toString() === userId;

		// Enforce authorization
		if (!isUser && !isDriver) 
      		return res.status(403).json({ message: 'Not authorized to update this ride' });

	     // Role-based sanity check
	    if (userRole === 'user' && !isUser) 
	      return res.status(403).json({ message: 'Only the requesting user can perform this action' });
	    

	    if ((userRole === 'rider' || userRole === 'driver') && !isDriver)
	      return res.status(403).json({ message: 'Only assigned driver can perform this action' });
	    

    	//restrict which role can set which statuses
    	const driverAllowed = ['rider_arrived', 'driver_arrived', 'in_progress', 'assigned', 'completed', 'cancelled'];
    	const userAllowed  = ['completed', 'cancelled'];

    	if (isDriver && !driverAllowed.includes(status)) 
      		return res.status(400).json({ message: `Driver cannot set status '${status}'` });
    
    	if (isUser && !userAllowed.includes(status)) 
      		return res.status(400).json({ message: `Rider cannot set status '${status}'` });
    

    	ride.status = status;
	    await ride.save();

	    //Ride notification based on ride.status (from notificationhelper)
	    if (ride.status !== 'completed') {
	    	await ride.populate('user', 'fullname email fcmToken phoneNumber');
				await ride.populate('driver', 'fullname');
		  	await rideNotification(ride, ride.status);
			}

		//For completed, only send if payment is already done
    if (ride.status === 'completed' && ride.paymentStatus === 'paid') {
      await rideNotification(ride, ride.status);
    }



		/*
	    if (ride.status === 'completed') {
			await rideNotification(ride, 'completed');
		}
		*/

	    // Free driver if trip ends
	    if (isDriver && ['completed', 'cancelled'].includes(status)) {
	      const driver = await Driver.findOne({ user: ride.driver._id });
	      if (driver) {
	        driver.status = 'available';
	        driver.currentRide = null;
	        await driver.save();
	      }
	    }

	    res.status(200).json({
	    	message: 'ride status updated successful',
	    	ride
	    });
    

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
}








/*


if(ride.status === 'assigned') {
	    	await queueNotification(ride.user._id, ['push','sms'], 'assigned', {
	    		title: 'Driver Assigned',
	    		body: `${ride.driver.fullname} is on the way`,
	    		phone: ride.user.phoneNumber,
	    		fcmToken: ride.user.fcmToken,
      			rideId: ride._id
	    	});
	    }

	    if (ride.status === 'rider_arrived') {
		    await queueNotification(ride.user._id, ['push','sms'], 'rider_arrived', {
		      title: 'Rider Arrived',
		      body: `${ride.driver.fullname} has arrived.`,
		      phone: ride.user.phoneNumber,
		      fcmToken: ride.user.fcmToken,
		      rideId: ride._id
		    });
		}

		if (ride.status === 'driver_arrived') {
		    await queueNotification(ride.user._id, ['push','sms'], 'driver_arrived', {
		      title: 'Driver Arrived',
		      body: `${ride.driver.fullname} has arrived.`,
		      phone: ride.user.phoneNumber,
		      fcmToken: ride.user.fcmToken,
		      rideId: ride._id
		    });
		}

		if (ride.status === 'completed') {
		    await queueNotification(ride.user._id, ['email','sms'], 'completed', {
		      title: 'Trip Completed',
		      body: `Your trip is complete. Total: ₦${ride.fare}`,
		      to: ride.user.email,
		      fcmToken: ride.user.fcmToken,
		      rideId: ride._id
		    });
		}


*/