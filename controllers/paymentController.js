//controllers/paymenController.js

const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');


const Ride = require('../models/ride');             //schema for actual ride booking
const Wallet = require('../models/wallet');			//schema for wallet 
const Driver = require('../models/driver');
const { calculateFare } = require('../util/fareCalculator');       //fare calculator
const { rideNotification } = require('../util/notificationHelper');


const PLATFORM_COMMISSION = Number(process.env.PLATFORM_COMMISSION_PERCENT);    //percentage slipt
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PLATFORM_USER_ID = process.env.PLATFORM_USER_ID || '000000000000000000000001';




//Helper: Distribute platform % and driver revenue
 
const distributeRevenue = async (ride, fareTotal) => {

	const driverWallet =
	    (await Wallet.findOne({ user: ride.driver._id })) ||
	    (await Wallet.create({ user: ride.driver._id }));

	const platformWallet =
	    (await Wallet.findOne({ user: PLATFORM_USER_ID })) ||
	    (await Wallet.create({ user: PLATFORM_USER_ID }));

	const platformCut = (PLATFORM_COMMISSION / 100) * fareTotal;
	const driverEarning = fareTotal - platformCut;

	// Credit driver
	driverWallet.balance += driverEarning;
	driverWallet.transactions.push({
	    type: 'credit',
	    amount: driverEarning,
	    description: `Earnings from ride ${ride._id}`,
	});

	await driverWallet.save();

	// Credit platform
	platformWallet.balance += platformCut;
	platformWallet.transactions.push({
	    type: 'credit',
	    amount: platformCut,
	    description: `Commission from ride ${ride._id}`,
	});
	
	await platformWallet.save();
};







//Post    Process ride payment
exports.payForRide = async (req, res, next) => {
	try{

		const { paymentMethod } = req.body       // pay with wallet, cash or card(flutterwave)
		
		// Validate payment method
    	const allowedPayment = ['wallet', 'cash', 'card'];

		if(!paymentMethod)
			return res.status(404).json({ message: 'paymentMethod is required'});
		
		if (!allowedPayment.includes(paymentMethod))
			return res.status(400).status({ message: `Invalid paymentMethod '${paymentMethod}'. Allowed paymentMethods are: ${allowedPayment.join(', ')} `});

		const ride = await Ride.findById(req.params.id)
											.populate('user')
											.populate('driver');

		if(!ride)
			return res.status(404).json({ message: 'Ride not found' });

		//validate ride payment and prevent double payment
		if(ride.paymentStatus === 'paid')
			return res.status(400).json({ message: 'Ride already been paid' });

		//Calculate fare
		const distance = ride.distance || 5;  // distance stored in km

		const fare = calculateFare(distance);


		//update ride datas
		ride.fare = fare.total;
		ride.paymentMethod = paymentMethod;



		//WALLET PAYMENT
		if(paymentMethod === 'wallet'){
			const wallet = await Wallet.findOne({ user: ride.user._id });
			
			if(!wallet)
				return res.status(400).json({ message: 'User wallet not found' });

			if(wallet.balance < fare.total)
				return res.status(400).json({ message: 'Insufficient wallet balance' });

			//Deduct fare
			wallet.balance -= fare.total;
			wallet.transactions.push({
				type: 'debit',
				amount: fare.total,
				description: `Ride payment for ${ride._id}`,
			});

			await wallet.save();

			//mark payment as paid
			ride.paymentStatus = 'paid';

			await ride.save();
		}


		// CASH PAYMENT
		if (paymentMethod === 'cash') {

			ride.paymentStatus = 'pending';
			

			//deduct platform % from driver's wallet
			if(ride.status === 'completed') {


				const driverWallet =
		          (await Wallet.findOne({ user: ride.driver._id })) ||
		          (await Wallet.create({ user: ride.driver._id }));

		        const platformWallet =
		          (await Wallet.findOne({ user: PLATFORM_USER_ID })) ||
		          (await Wallet.create({ user: PLATFORM_USER_ID }));


				const platformCut = (PLATFORM_COMMISSION / 100) * fare.total;
				
				//enforce driver to fund wallet if wallet balance is less than platform %
				if(driverWallet.balance <= platformCut) {   
					const driver = await Driver.findOne({ user: ride.driver._id });
					driver.status.push({
						type: 'on-trip',
					});

					return res.status(400).json({ message: 'Driver wallet too low. Please fund to accept rides'});
				}


				//debit driver wallet
				driverWallet.balance -= platformCut;
				driverWallet.transactions.push({
					type: 'debit',
					amount: platformCut,
					description: `Debit for cash ride ${ride._id}`,
				});

				await driverWallet.save();


				//credit platform wallet
				platformWallet.balance += platformCut;
				platformWallet.transactions.push({
					type: 'credit',
					amount: platformCut,
					description: `Cash ride commission from ride ${ride._id}`,  
				});

				await platformWallet.save();

				ride.paymentStatus = 'paid';
				await ride.save()



				
			}
		}

				/*
				if (driverWallet.balance < MINIMUM_REQUIRED_BALANCE) {
			  await Driver.findOneAndUpdate(
			    { user: ride.driver._id },
			    { isActive: false }
			  );
			  return res.status(400).json({
			    message: 'Driver wallet too low. Please fund your wallet to continue receiving rides.',
			  });
			}
				*/


		//CARD PAYMENT  (Paystack)
		if (paymentMethod === 'card') {

			// initialize Paystack transaction
		    if (!PAYSTACK_SECRET_KEY) 
		        return res.status(500).json({ message: 'Paystack not configured on backend (PAYSTACK_SECRET_KEY missing)' });
		    

		    const amountKobo = fare.total * 100;      //convert # to kobo
		    const email = ride.user.email;
		    const initializeBody = {
		        email,
		        amount: amountKobo,
		        metadata: { rideId: ride._id.toString(), userId: ride.user._id.toString() }
		    };

		    const initRes = await axios.post(
		    	'https://api.paystack.co/transaction/initialize', 
		    	initializeBody, 
		    	{
		        	headers: { 
		        		Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`, 
		        		'Content-Type': 'application/json' 
		        	},
		    	}
		    );

		    if (!initRes.data || !initRes.data?.data) 
		        return res.status(502).json({ message: 'Failed to initialize Paystack transaction' });
		    

		    // store reference so we can verify later
		      ride.paymentReference = initRes.data.data.reference;
		      ride.paymentStatus = 'initialized';
		      await ride.save({ validateBeforeSave: false });            // ensure it saves even if other fields incomplete

		    console.log(`✅ Ride ${ride._id} initialized with Paystack reference: ${ride.paymentReference}`);

		    return res.status(200).json({
		        message: 'Paystack transaction initialized',
		        authorization_url: initRes.data.data.authorization_url,
		        reference: initRes.data.data.reference
		    });
		}






		// FINAL REVENUE SPLIT
	    if (ride.paymentStatus === 'paid') {
		    await distributeRevenue(ride, fare.total);
		}

		await ride.save();

		res.status(200).json({
		    message: 'Ride payment processed successfully',
		    paymentSummary: {
		        totalFare: fare.total,
		        driverEarning:
		          ride.paymentStatus === 'paid'
		            ? fare.total - (PLATFORM_COMMISSION / 100) * fare.total
		            : 0,
		        platformCut: (PLATFORM_COMMISSION / 100) * fare.total,
		        paymentStatus: ride.paymentStatus,
		        paymentMethod,
		    },
		    ride,
		});

		// After ride.save() and revenue distribution
		if (ride.status === 'completed' && ride.paymentStatus === 'paid') {
		  await ride.populate('user', 'fullname email fcmToken phoneNumber');
		  await ride.populate('driver', 'fullname');
		  await rideNotification(ride, 'completed');
		}
		  
	} catch (err) {
		console.error('payForRide error:', err);
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};





//PUT    Update paymentStatus for cash payment
exports.confirmCashPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findById(id).populate('user').populate('driver');
    if (!ride) 
    	return res.status(404).json({ message: 'Ride not found' });

    if (ride.paymentMethod !== 'cash')
      return res.status(400).json({ message: 'This ride is not a cash payment' });

    if (ride.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Ride already marked as paid' });

    // Mark as paid and distribute platform cut
    ride.paymentStatus = 'paid';
    await distributeRevenue(ride, ride.fare);
    await ride.save();

    // Send notification
    await ride.populate('user', 'fullname email fcmToken phoneNumber');
    await ride.populate('driver', 'fullname');
    await rideNotification(ride, 'completed');

    return res.status(200).json({ message: 'Cash payment confirmed', ride });
  } catch (err) {
    console.error('confirmCashPayment error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};







//POST    Verify paystack
exports.verifyPaystackPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) 
    	return res.status(400).json({ message: 'reference required' });
    
    if (!PAYSTACK_SECRET_KEY) 
    	return res.status(500).json({ message: 'Paystack not configured' });

    const verifyRes = await axios.get(
    	`https://api.paystack.co/transaction/verify/${reference}`, 
    	{
      		headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
    	}
    );

    if (!verifyRes.data || verifyRes.data.status !== true || verifyRes.data.data.status !== 'success') 
    	return res.status(400).json({ message: 'Payment not successful or not verified', data: verifyRes.data });
    

    // success — find ride by reference, mark paid, distribute revenue
    const ride = await Ride.findOne({ paymentReference: reference })
    													.populate('driver');

    if (!ride) 
    	return res.status(404).json({ message: 'Ride not found for this reference' });

    //validate ride payment and prevent double payment
		if(ride.paymentStatus === 'paid')
			return res.status(400).json({ message: 'Ride already been paid' });

    // update ride as paid
    ride.paymentStatus = 'paid';
    await distributeRevenue(ride, ride.fare || 0);
    await ride.save();

    return res.status(200).json({ message: 'Payment verified & revenue distributed', ride });
  } catch (err) {
    console.error('verifyPaystackPayment error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};



//POST
exports.paystackWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const bodyRaw = JSON.stringify(req.body);

    if (!PAYSTACK_SECRET_KEY) 
    	return res.status(500).send('Paystack key missing');

    // verify signature
    const hash = crypto
    	.createHmac('sha512', PAYSTACK_SECRET_KEY)
    	.update(bodyRaw)
    	.digest('hex');

    if (hash !== signature) 
      return res.status(400).send('Invalid signature');
    

    const event = req.body;

    // handle successful charge
    if (event.event === 'charge.success' && event.data && event.data.status === 'success') {
      const reference = event.data.reference;
      const amount = event.data.amount / 100;                 // kobo -> naira

      
      const ride = await Ride.findOne({ paymentReference: reference }).populate('driver');
      if (!ride) 
        return res.status(200).send('ride not found');        // ack to paystack
      

      // ensure idempotency: if already paid, ack
      if (ride.paymentStatus === 'paid') {
        return res.status(200).send('already processed');
      }

      // mark paid and distribute
      ride.paymentStatus = 'paid';
      await distributeRevenue(ride, amount || ride.fare || 0);
      await ride.save();

      //Trigger completed notification after successful payment
			await ride.populate('user', 'fullname email fcmToken phoneNumber');
			await ride.populate('driver', 'fullname');
			await rideNotification(ride, 'completed');

      return res.status(200).send('ok');
    }

    // ack other events
    res.status(200).send('ignored');
  } catch (err) {
    console.error('paystackWebhook error', err);
    res.status(500).send('server error');
  }
};
