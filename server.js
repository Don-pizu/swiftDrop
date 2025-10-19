//server.js

const app = require('./app');
const PORT = process.env.PORT || 5000;
const http = require("http");
const initChat = require('./util/chatService');


// Create one HTTP server for both Express + Socket.IO
const server = http.createServer(app);

// Init socket.io here
initChat(server);

server.listen(PORT, () => {
	console.log(`Server + Socket.IO  running on port ${PORT}`);
});