//config/firebase.js


const admin = require('firebase-admin');

// Initialize Firebase using Application Default Credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

console.log('✅ Firebase initialized successfully!');

module.exports = admin;

