// confid/db.js

const mongoose = require ('mongoose');

const connectDB = async () => {

	if (process.env.NODE_ENV === 'test') {
	    console.log('Skipping DB connection in test mode');
	    return;
	  }

	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);     //connect to mongoDB
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (err) {
		console.log(`Error: ${err.message}`);
		process.exit(1);         //stop connecting if DB fail
	}

}; 

module.exports = connectDB;