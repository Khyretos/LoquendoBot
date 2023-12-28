/* global settings */

const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const localServer = http.createServer(app);
const io = require('socket.io')(localServer);

const requestCount = 0;

function startVtuberModule() {
  if (!settings.MODULES.USE_VTUBER) {
    return;
  }

  app.use('/vtuber', express.static(path.join(__dirname, '../modules/vtuber/')));

  const vtuber = document.body.querySelector('#BrowsersourceVtuber');
  const vtuberframe = document.createElement('iframe');
  vtuberframe.class = 'frame';
  vtuberframe.src = `http://localhost:${settings.GENERAL.PORT}/vtuber`;
  vtuberframe.style.width = '100%';
  vtuberframe.style.height = '100%';
  vtuberframe.frameBorder = 0;
  vtuber.appendChild(vtuberframe);
}

startVtuberModule();

function startChatBubbleModule() {
  if (!settings.MODULES.USE_CHATBUBBLE) {
    return;
  }

  app.use('/chat', express.static(path.join(__dirname, '../modules/chat')));

  const chat = document.body.querySelector('#BrowsersourceChat');
  const chatframe = document.createElement('iframe');
  chatframe.class = 'frame';
  chatframe.src = `http://localhost:${settings.GENERAL.PORT}/chat`;
  chatframe.style.width = '100%';
  chatframe.style.height = '100%';
  chatframe.frameBorder = 0;
  chat.appendChild(chatframe);
}

startChatBubbleModule();

function startSTT() {}

// Middleware to conditionally serve routes
app.use((req, res, next) => {
  if (!settings.MODULES.USE_VTUBER && req.path === '/vtuber') {
    res.sendStatus(404); // Return a 404 status for /vtuber when it's disabled
  } else if (!settings.MODULES.USE_CHATBUBBLE && req.path === '/chat') {
    res.sendStatus(404); // Return a 404 status for /chat when it's disabled
  } else {
    next(); // Proceed to the next middleware or route handler
  }
});

localServer.listen(settings.GENERAL.PORT, () => {
  startVtuberModule();
  startChatBubbleModule();
});

// Handle socket connections
io.on('connection', socket => {
  // Receive data from the client
  socket.on('message', data => {});

  // Receive data from the client
  socket.on('xxx', (logoUrl, username, message) => {
    socket.broadcast.emit('message', logoUrl, username, message);
  });

  socket.on('disconnect', () => {});
});

module.exports = { startVtuberModule, startChatBubbleModule };
