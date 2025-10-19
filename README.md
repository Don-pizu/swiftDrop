# Title
SwiftDrop ride-hailing API

## Description
SwiftDrop is a scalable and secure **ride-hailing API backend** built with Node.js, Express, and MongoDB.  
It provides features for **user authentication, ride requests, driver onboarding, payments and trip tracking**.


## Features

**Authentication & Authorization**
  - JWT-based login/registration for riders & drivers.
  - OTP verification flow for secure onboarding.
  - Role-based access control (User, Admin, Rider, Driver)

**Ride Management**
  - Request, accept and cancel rides.
  - Real-time trip updates.

**Driver KYC**
  - Document and photo upload for verification.
  - Vehicle details (plate number, car model, license).

**Payments**
  - Ready for integration with Paystack, Flutterwave, or Stripe
  - Fund, withdraw, and track wallet balance
  - Confirm cash or online ride payments

**Geolocation**
  - Save pickup/drop-off coordinates
  - Find nearby drivers (geo-matching system)

**Notifications**
  - Personalized and broadcast notifications
  - Manage notification preferences
  - Mark, resend, or delete notifications

**Admin Dashboard (future-ready)**
  - Monitor drivers, riders, and completed trips.
  - Perform CRUD operations on key resources


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


## KYC Routes
| Method | Endpoint       | Description         | Access               |
| ------ | -------------- | ------------------- | -------------------- |
| POST   | `/api/kyc`     | Create KYC profile  | Rider, Driver, Admin |
| GET    | `/api/kyc/:id` | Get specific KYC    | Rider, Driver, Admin |
| GET    | `/api/kycs`    | Get all KYC records | Admin                |
| PUT    | `/api/kyc/:id` | Update KYC          | Rider, Driver, Admin |
| DELETE | `/api/kyc/:id` | Delete KYC          | Admin                |



## Driver Routes
| Method | Endpoint              | Description                      | Access               |
| ------ | --------------------- | -------------------------------- | -------------------- |
| POST   | `/api/drivers`        | Create driver profile            | Rider, Driver, Admin |
| GET    | `/api/drivers/:id`    | Get a driver                     | Private              |
| GET    | `/api/drivers`        | Get all drivers                  | Private              |
| PUT    | `/api/drivers/:id`    | Update driver status or location | Rider, Driver, Admin |
| GET    | `/api/drivers/nearby` | Find nearby drivers              | User, Admin          |
| DELETE | `/api/drivers/:id`    | Delete driver                    | Admin                |


## Ride Routes
| Method | Endpoint                | Description        | Access               |
| ------ | ----------------------- | ------------------ | -------------------- |
| POST   | `/api/rides`            | Request a ride     | User, Rider, Admin   |
| GET    | `/api/rides/:id`        | Get ride by ID     | User, Rider, Admin   |
| GET    | `/api/rides`            | Get all rides      | Admin                |
| PUT    | `/api/rides/:id/accept` | Accept ride        | Rider, Driver, Admin |
| PUT    | `/api/rides/:id/status` | Update ride status | Rider, Driver, Admin |
| DELETE | `/api/rides/:id/cancel` | Cancel ride        | User, Admin          |


## Wallet Routes
| Method | Endpoint                     | Description             | Access               |
| ------ | ---------------------------- | ----------------------- | -------------------- |
| GET    | `/api/wallets`               | Get wallet details      | Private              |
| POST   | `/api/wallets/fund`          | Fund wallet             | Private              |
| POST   | `/api/wallets/withdraw`      | Withdraw from wallet    | Private              |
| DELETE | `/api/wallets/:id`           | Delete wallet           | Admin                |
| POST   | `/api/ride/payment/:id`      | Pay for a ride          | Private              |
| PUT    | `/api/ride/:id/confirm-cash` | Confirm cash payment    | Rider, Driver, Admin |
| POST   | `/api/payment/verify`        | Verify Paystack payment | Private              |
| POST   | `/api/payment/webhook`       | Handle payment webhook  | Public               |


## Notification Routes
| Method | Endpoint                           | Description                 | Access  |
| ------ | ---------------------------------- | --------------------------- | ------- |
| POST   | `/api/notifications/broadcast`     | Send broadcast notification | Admin   |
| POST   | `/api/notifications/resend/:id`    | Resend notification         | Admin   |
| GET    | `/api/notifications`               | Get user notifications      | Private |
| PUT    | `/api/notifications/:id/read`      | Mark as read                | Private |
| PUT    | `/api/notifications/mark-all-read` | Mark all as read            | Private |
| DELETE | `/api/notifications/:id`           | Delete notification         | Private |


## Notification Preference Routes
| Method | Endpoint                        | Description        | Access  |
| ------ | ------------------------------- | ------------------ | ------- |
| GET    | `/api/notification/preferences` | Get preferences    | Private |
| PUT    | `/api/notification/preferences` | Update preferences | Private |
| DELETE | `/api/notification/preferences` | Reset preferences  | Private |





## Example .env Configuration

Create a .env file in the root directory with the following keys:
  # === SERVER CONFIG ===
  PORT=

  # === DATABASE ===
  MONGO_URI=

  # === JWT AUTH ===
  JWT_SECRET=

  # === EMAIL SERVICE (optional, for OTP or reset links) ===
  SMTP_HOST=
  SMTP_PORT=
  SMTP_USER=
  SMTP_PASS=

  # === TWILIO SMS CONFIG ===
  TWILIO_ACCOUNT_SID=
  TWILIO_AUTH_TOKEN=
  TWILIO_PHONE_NUMBER=

  # === TERMII SMS CONFIG ===
  TERMII_API_KEY=
  TERMII_SENDER=

  # === PLATFORM SETTINGS ===
  PLATFORM_COMMISSION_PERCENT=
  PLATFORM_USER_ID=

  # === PAYMENT CONFIG ===
  PAYSTACK_SECRET_KEY=





## Author name

-Asiru Adedolapo

## Stage, Commit, and Push**

```bash

git add .
git commit -m "feat: initial project setup with folder structure and README"
git branch -M main
git remote add origin https://github.com/Don-pizu/swiftdrop.git
git push -u origin main

