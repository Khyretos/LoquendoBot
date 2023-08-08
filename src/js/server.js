const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

if (!settings.SERVER.USE_SERVER) {
    return;
}

const PORT = settings.SERVER.PORT;

let isVtuberEnabled = true;
let isChatBubbleEnabled = true;

function startVtuber() {
    if (!settings.SERVER.USE_VTUBER) {
        isVtuberEnabled = false;
        return;
    }

    app.use('/vtuber', express.static(path.join(resourcesPath, './modules/vtuber/')));

    let vtuber = document.body.querySelector('#BrowsersourceVtuber');
    let vtuberframe = document.createElement('iframe');
    vtuberframe.class = 'frame';
    vtuberframe.src = `http://localhost:${PORT}/vtuber`;
    vtuberframe.style.width = '100%';
    vtuberframe.style.height = '100%';
    vtuberframe.frameBorder = 0;
    vtuber.appendChild(vtuberframe);
}

function startChatBubble() {
    if (!settings.SERVER.USE_CHATBUBBLE) {
        isChatBubbleEnabled = false;
        return;
    }

    app.use('/chat', express.static(path.join(resourcesPath, './modules/chat')));

    let chat = document.body.querySelector('#BrowsersourceChat');
    let chatframe = document.createElement('iframe');
    chatframe.class = 'frame';
    chatframe.src = `http://localhost:${PORT}/chat`;
    chatframe.style.width = '100%';
    chatframe.style.height = '100%';
    chatframe.frameBorder = 0;
    chat.appendChild(chatframe);
}

// Middleware to conditionally serve routes
app.use((req, res, next) => {
    if (!isVtuberEnabled && req.path === '/vtuber') {
        res.sendStatus(404); // Return a 404 status for /vtuber when it's disabled
    } else if (!isChatBubbleEnabled && req.path === '/chat') {
        res.sendStatus(404); // Return a 404 status for /chat when it's disabled
    } else {
        next(); // Proceed to the next middleware or route handler
    }
});

http.listen(PORT, () => {
    startVtuber();
    startChatBubble();
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

module.exports = { startVtuber, startChatBubble };
