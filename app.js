//app.js

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require('express');
const app = express();
const connectDB = require('./config/db');
const path = require("path");
const http = require('http');



// NEW: security libs
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitize = require('mongo-sanitize');
const xss = require('xss-clean');

const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const driverRoutes = require('./routes/driverRoutes');
const rideRoutes = require('./routes/rideRoutes');
const walletRoutes = require('./routes/walletRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationPreferenceRoutes = require('./routes/notificationPreferenceRoutes');

const { swaggerUi, swaggerSpec } = require('./swagger');


//DB connection
connectDB();

// Security hardening
//helmet
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net",
        "https://cdn.socket.io",   // allow socket.io CDN
        "'unsafe-eval'",   //  needed for tesseract.js
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      connectSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://cdn.jsdelivr.net",   //allow worker importScripts
        "https://cdn.socket.io",
        "http://localhost:5000",
        //"https://onrender.com",
      ],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https://fake-drug-verification.onrender.com"], // 👈 FIX: allow blob: images
    },
  })
);




//mongoSanitize
app.use((req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.params) req.params = sanitize(req.params);
  if (req.query) req.query = sanitize(req.query);
  next();
});


// xss
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }

  if (req.params && typeof req.params === 'object') {
    for (let key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = xss(req.params[key]);
      }
    }
  }

  next();   
});

  //ratelimit
const limiter = rateLimit({ 
windowMs: 15 * 60 * 1000, // 15 minutes 
max: 30, // max 30 requests per IP 
message: 'Too many requests from this IP, please try again later.' 
}); 
app.use('/api', limiter);



// CORS configuration
const allowedOrigins = [
  'http://localhost:5000',
  'null', //To allow frontend guys to work freely for now  
  ]; 

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



//Middleware to parse JSON
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Routes
app.use('/api/auth', authRoutes);
app.use('/api', kycRoutes);
app.use('/api', driverRoutes);
app.use('/api', rideRoutes);
app.use('/api', walletRoutes);
app.use('/api', paymentRoutes);
app.use('/api', notificationRoutes);
app.use('/api', notificationPreferenceRoutes);

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;