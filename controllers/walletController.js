//controllers/walletController.js

const User = require('../models/User');
const Wallet = require('../models/wallet');



// Utility to ensure every user has a wallet
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }
  return wallet;
};



//GET   Get wallet
exports.getWallet = async (req, res, next) => {

	try {
	    const wallet = await getOrCreateWallet(req.user._id);
		res.status(200).json(wallet);

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//POST    Fund wallet
exports.fundWallet = async (req, res, next) => {

	try {
	    const { amount, reference, description } = req.body;

	    if(!amount || amount <= 0.1)
	    	return res.status(404).json({ message: 'Amount must be greater than 1'});
	    
	   // if(typeof amount !== 'number')
	    //	return res.status(404).json({ message: 'Amount must be number not string'});
	    
	    const amountValue = Number(amount);

	    if (isNaN(amountValue) || amountValue <= 0) 
  			return res.status(400).json({ message: 'Invalid amount. Must be a number not string.' });


	    const wallet = await getOrCreateWallet(req.user._id);

	    //update wallet datas
	    wallet.balance += amountValue;

	    wallet.transactions.push({
	      type: 'credit',
	      amount: amountValue,
	      reference: reference || `TXN-${Date.now()}`,
	      description: description || 'Wallet funding'
	    });

	    await wallet.save();

	    res.status(200).json({ 
	    	message: 'Wallet funded successfully', 
	    	wallet 
	    });

    } catch (err) {
    	res.status(500).json({ message: err.message || 'Internal server error' });
	}
};



//POST       Withdraw from wallet (driver withdraws earnings)
exports.withdrawWallet = async (req, res, next) => {
    try {
	    const { amount, description } = req.body;

	    if(!amount || amount <= 0.1)
		    	return res.status(404).json({ message: 'Amount must be greater than 1'});

		const amountValue = Number(amount);

	    if (isNaN(amountValue) || amountValue <= 0) 
  			return res.status(400).json({ message: 'Invalid amount. Must be a number not string.' });


	    const wallet = await getOrCreateWallet(req.user._id);

	    if (wallet.balance < amount) {
	      return res.status(400).json({ message: 'Insufficient funds' });
	    }

	    //update wallet datas
	    wallet.balance -= amountValue;
	    
	    wallet.transactions.push({
	      type: 'debit',
	      amount: amountValue,
	      reference: `WD-${Date.now()}`,
	      description: description || 'Wallet withdrawal'
	    });

	    await wallet.save();
	    res.status(200).json({ message: 'Withdrawal successful', wallet });
	  
  	} catch (err) {
    	res.status(500).json({ message: err.message || 'Internal server error' });
	}
};


//DELETE    Delete wallet
exports.deleteWallet = async (req, res, next) => {
	try {
		const wallet = await Wallet.findById(req.params.id);

		if (!wallet) 
			return res.status(404).json({ message: 'Wallet not found' });

		await wallet.deleteOne();

		res.status(200).json({ message: 'Wallet deleted successful'});

	} catch (err) {
		res.status(500).json({ message: err.message || 'Internal server error' });
	}
}