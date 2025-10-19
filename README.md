# Title
SwiftDrop ride-hailing API

## Description
SwiftDrop is a scalable and secure **ride-hailing API backend** built with Node.js, Express, and MongoDB.  
It provides features for **user authentication, ride requests, driver onboarding, payments and trip tracking**.


## Features

**Authentication & Authorization**
  - JWT-based login/registration for riders & drivers.
  - OTP verification flow for secure onboarding.

**Ride Management**
  - Request, accept and cancel rides.
  - Real-time trip updates.

**Driver KYC**
  - Document and photo upload for verification.
  - Vehicle details (plate number, car model, license).

**Payments**
  - Integration-ready with Stripe/Paystack/Flutterwave.

**Geolocation**
  - Trip tracking with pickup & drop-off coordinates.

**Admin Dashboard (future-ready)**
  - Monitor drivers, riders, and completed trips.


## Installation & Usage instructions\
git clone https://github.com/your-username/swiftdrop.git

# Navigate into the project folder
cd swiftdrop

# Install dependencies
npm install

# Start the server
node server.js


project-root/
│   ├── config/        # Environment & database config
│   ├── controllers/   # Route handlers
│   ├── middlewares/   # Auth & request validation
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   └── utils/         # Helper functions
├── .env.example       # Example environment variables
├── package.json
└── README.md



## Technologies used
-Node.js
-multer
-Express.js
-MongoDB
-JWT Authentication
-Bcrypt.js (password hashing)
-Crypto
-dotenv (environment variables)
-Helmet, Express-rate-limit, Mongo-sanitize, XSS-clean (security)



## API Endpoints

## API Endpoints

## Auth Routes
Method       Endpoint                 Description              Access
POST    api/auth/register          Register a new user         Public
POST    api/auth/verifyOtp         Verify OTP code             Public
POST    api/auth/resendOtp         Resend OTP code             Public
POST    api/auth/forgotPassword    Forgot password             Public
POST    api/auth/reset-password/:token    Reset password       Public
POST    api/auth/login             Login an existing user      Public
GET     api/auth/allusers          Get all users route         Private(admin)
GET     api/auth/me                Get user profile            Private
PUT     api/auth/update            Update user                 Private



## Author name

-Asiru Adedolapo

## Stage, Commit, and Push**

```bash

git add .
git commit -m "feat: initial project setup with folder structure and README"
git branch -M main
git remote add origin https://github.com/Don-pizu/swiftdrop.git
git push -u origin main

