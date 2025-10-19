//middleware/upload.js

const multer = require('multer');
const path = require('path');


// Set storage engine
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');         //Save files to 'uploads' folder
	},

	filename: function (req, file, cb) {
		const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname);
		cb(null, uniqueName + ext);                 // e.g., 1659988891234-123456789.jpg
	},
});


// File filter: only allow certain types
const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpg|jpeg|png|gif|mp4|mov|avi|mkv/;

	const ext = path.extname(file.originalname).toLowerCase();
	const mime = file.mimetype.toLowerCase();

	if(allowedTypes.test(ext) && allowedTypes.test(mime)) {
		cb(null, true);
	} else {
		cb(new Error('Unsupported file type'), false);
	}
};


//Multer upload setup
const upload = multer({
	storage,
	limits: {
		fileSize: 200 * 1024 * 1024, // 20MB max 
	},
	fileFilter
});

module.exports = upload;