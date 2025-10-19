//controller/kycController.js

const User = require('../models/User');
const KYC = require('../models/KYC');


//POST  Upload KYC
exports.createKYC = async (req, res, next) => {
	try {

		const user = req.user;

		//fetch user data
		const dbUser = await User.findById(user._id)

		//	Rider KYC 
		if (dbUser.role === 'rider') {
			try {
				const { bikeDetails, address} = req.body;

				if ( !bikeDetails || !address)
					return res.status(400).json({ message: 'All fields are required'});

				//KYC USER PICTURE
				let kycUserPicture = req.files?.kycUserPicture
					? `/uploads/${req.files.kycUserPicture[0].filename}` 
  					: '';

				//ID CARD PICTURE
  				let idCard = req.files?.idCard
					? `/uploads/${req.files.idCard[0].filename}` 
  					: '';

				//create rider user kyc
				const kyc = await KYC.create({
					user: user._id,
					kycUserPicture,
					idCard,
					bikeDetails,
					address,
					status: 'pending',
				}); 

				res.status(201).json({
					message: 'Rider KYC successfully submitted',
					kyc
				});

			} catch (err) {
				res.status(500).json({ message: err.message || 'Internal server error' });
			}
		}


		//KYC for driver
		else if(dbUser.role === "driver") {
			try {

				const {vehicleDetails, address} = req.body;

				if ( !vehicleDetails || !address)
					return res.status(400).json({ message: 'All fields are required'});

				//KYC USER PICTURE
				let kycUserPicture = req.files?.kycUserPicture
					? `/uploads/${req.files.kycUserPicture[0].filename}` 
  					: '';

				//ID CARD PICTURE
				let idCard = req.files?.idCard
					? `/uploads/${req.files.idCard[0].filename}` 
  					: '';

				//DRIVER'S LICENSE PICTURE
				let driverLicense = req.files?.driverLicense
					? `/uploads/${req.files.driverLicense[0].filename}` 
  					: '';

				//create driver user kyc
				const kyc = await KYC.create({
					user: user._id,
					kycUserPicture,
					idCard,
					driverLicense,
					vehicleDetails,
					address,
					status: 'pending',
				}); 

				res.status(201).json({
					message: 'Driver KYC successfully submitted',
					kyc
				});

			} catch (err) {
				res.status(500).json({ message: err.message || 'Internal server error' });
			}
		}

	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};


//GET Get KYC by Id
exports.getKYC = async (req, res, next) => {
	try {
		const kyc = await KYC.findById(req.params.id);

		if(!kyc)
			return res.status(404).json({ message: 'Kyc is not found'});

		res.json(kyc);

	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};


//GET  Get all KYC
exports.getAllKYC = async (req, res, next) => {
	try {

		const { page = 1, limit = 10, bikeDetails, vehicleDetails } = req.query;
		const query = {};   //for filtering

		if(bikeDetails) {
			query.bikeDetails = bikeDetails;
		}

		if(vehicleDetails) {
			query.vehicleDetails = vehicleDetails;
		}

		const skip = (page - 1) * limit;

		const kyc = await KYC.find(query)
								.populate('user', 'email phoneNumber')
								.skip(skip)
								.limit(parseInt(limit))
								.sort({createdAt: -1});

		//count total kyc
		const totalKYC = await KYC.countDocuments(query);

		//total pages
		const totalPages = Math.ceil( totalKYC / limit );

		res.json({
			kyc,
			pages: parseInt(page),
			totalPages,
			totalKYC
		});


	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};



//PUT   Update KYC
exports.updateKYC = async (req, res, next) => {
	try {

		const kyc = await KYC.findById(req.params.id);

		if(!kyc) 
			return res.status(404).json({ message: 'KYC is not found'});

		const { bikeDetails, vehicleDetails, address } = req.body;

		//for bike details	
		if (bikeDetails?.plateNumber) 
			kyc.bikeDetails.plateNumber = bikeDetails.plateNumber;
		if (bikeDetails?.bikeModel) 
			kyc.bikeDetails.bikeModel = bikeDetails.bikeModel;
		if (bikeDetails?.colour) 
			kyc.bikeDetails.bikeColour = bikeDetails.bikeColour;


		//for vehicle details
		if (vehicleDetails?.plateNumber) 
			kyc.vehicleDetails.plateNumber = vehicleDetails.plateNumber;
		if (vehicleDetails?.carModel) 
			kyc.vehicleDetails.carModel = vehicleDetails.carModel;
		if (vehicleDetails?.carColor) 
			kyc.vehicleDetails.carColor = vehicleDetails.carColor;
		

		if(address)
			kyc.address = address;

		// update images if new one is uploaded
	    if (req.files?.kycUserPicture) {
		  kyc.kycUserPicture = `/uploads/${req.files.kycUserPicture[0].filename}`;
		}

	    if (req.files?.idCard) {
		  kyc.idCard = `/uploads/${req.files.idCard[0].filename}`;
		}

	    if (req.files?.driverLicense) {
		  kyc.driverLicense = `/uploads/${req.files.driverLicense[0].filename}`;
		}

	    await kyc.save();

	    res.status(200).json({
	    	message: 'KYC records updated succesffuly',
	    	kyc
	    });

	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};



//DELETE Delete KYC by id
exports.deleteKYC = async (req, res, next) => {
	try {

		const kyc = await KYC.findById(req.params.id);

		if(!kyc)
			return res.status(404).json({ message: 'Kyc not foud' });

		//Delete kyc
		await kyc.deleteOne();

		res.status(200).json({ message: 'Kyc deleted succesffuly'})

	} catch (err) {
		res.status(500).json({ message: 'Internal server error' });
	}
};
