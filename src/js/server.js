const express = require('express');

const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

if (!config.settings.SERVER.USE_SERVER) {
	return;
}

const PORT = config.settings.SERVER.PORT;

http.listen(PORT, () => {
	if (config.settings.SERVER.USE_VTUBER) {
		app.use('/vtuber', express.static(path.join(__dirname, '../modules/vtuber/')));

		let vtuber = document.body.querySelector('#BrowsersourceVtuber');
		let vtuberframe = document.createElement('iframe');
		vtuberframe.class = "frame";
		vtuberframe.src = `http://localhost:${PORT}/vtuber`;
		vtuberframe.style.width = "100%";
		vtuberframe.style.height = "100%";
		vtuberframe.frameBorder = 0;
		vtuber.appendChild(vtuberframe);
	}

	if (config.settings.SERVER.USE_CHATBUBBLE) {
		app.use('/chat', express.static(path.join(__dirname, '../modules/chat')));

		let chat = document.body.querySelector('#BrowsersourceChat');
		let chatframe = document.createElement('iframe');
		chatframe.class = "frame";
		chatframe.src = `http://localhost:${PORT}/chat`;
		chatframe.style.width = "100%";
		chatframe.style.height = "100%";
		chatframe.frameBorder = 0;
		chat.appendChild(chatframe);
	}
});

// Handle socket connections
io.on('connection', (socket) => {

	// Receive data from the client
	socket.on('message', (data) => { });

	// Receive data from the client
	socket.on('xxx', (logoUrl, username, message) => {
		socket.broadcast.emit('message', logoUrl, username, message);
	});

	socket.on('disconnect', () => { });
});
