//models/chat.js model

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  user: String,
  text: String,
  file: String,
  chat: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Chat", chatSchema);
