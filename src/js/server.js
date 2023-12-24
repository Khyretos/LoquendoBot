const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const localServer = http.createServer(app);
const io = require('socket.io')(localServer);

let requestCount = 0;

function startVtuberModule() {
    if (!settings.MODULES.USE_VTUBER) {
        return;
    }

    app.use('/vtuber', express.static(path.join(__dirname, '../modules/vtuber/')));

    let vtuber = document.body.querySelector('#BrowsersourceVtuber');
    let vtuberframe = document.createElement('iframe');
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

    let chat = document.body.querySelector('#BrowsersourceChat');
    let chatframe = document.createElement('iframe');
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

    if (settings.TTS.USE_TTS) {
        // internalTTS.getInstalledVoices();
    }
});

// Handle socket connections
io.on('connection', (socket) => {
    // Receive data from the client
    socket.on('message', (data) => {});

    // Receive data from the client
    socket.on('xxx', (logoUrl, username, message) => {
        socket.broadcast.emit('message', logoUrl, username, message);
    });

    socket.on('disconnect', () => {});
});

module.exports = { startVtuberModule, startChatBubbleModule };
