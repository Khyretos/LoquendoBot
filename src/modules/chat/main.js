// Connect to the Socket.IO server
const socket = io();

// Emit a message to the server
socket.emit('message', 'Hello, Server!');

function getPostTime() {
    const d = new Date();
    document.body.querySelectorAll('.container').innerHTML = d.getHours();
    const hours = d.getHours();
    const minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    const time = `${hours}:${minutes}`;
    return time;
}

function showChatMessage(article) {
    const main = document.querySelector('#chatBox');
    main.appendChild(article);
    main.scrollTop = main.scrollHeight;
}

let textStreamContainer;
let x;
// const totalDuration = 5000; // Total duration in milliseconds
// const charactersPerSecond = 20; // Adjust the number of characters to display per second

// const streamingSpeed = totalDuration / (textToStream.length / charactersPerSecond);

let currentIndex = 0;
let messageStream = '';
let tempMessageObject = '';
let fullMessageLength = 0;

function getFullMessageLength(text) {
    let fullMessageLength = 0;
    text.forEach(element => {
        if (element.text) {
            fullMessageLength += element.text.length;
        }
        element.html
        fullMessageLength += 1;
    });

    return fullMessageLength;
}

function streamText() {
    // if (currentIndex < fullMessageLength) {

    //     textStreamContainer.innerHTML += messageStream.filtered.charAt(currentIndex);
    //     currentIndex++;
    //     setTimeout(streamText, 50);
    // }
    if (currentIndex < messageStream.length) {

        textStreamContainer.innerHTML += messageStream.charAt(currentIndex);
        currentIndex++;
        setTimeout(streamText, 50);
    } else {
        currentIndex = 0;
        x.classList.add('fade-outx');
    }
}

function displayTwitchMessage(logoUrl, username, messageObject) {
    console.log(messageObject);
    if (!messageObject) {
        return;
    }

    const root = document.querySelector(':root');
    root.style.setProperty('--variable', '5s');

    const article = document.createElement('article');
    x = article;

    article.className = 'msg-container';

    const placeMessage = `
                  <div class="thomas bounce-in">
                      <div class="message"></div>
											<div class="sender"></div>
                      <div class="speechbubble"></div>
											<div class="arrow"></div>
                  </div>
                  `.trim();

    article.innerHTML = placeMessage;
    const msg = article.querySelector('.message');

    msg.innerHTML = `<div class="sender">${username}</div>`//\n${message}`;

    msg.style.fontSize = '12pt';

    showChatMessage(article);

    const elements = document.getElementsByClassName('msg-container');
    if (elements.length > 1) {
        elements[0].remove();
    }

    article.addEventListener('animationend', (e) => {
        if (e.animationName == 'fade-outx') {
            article.remove();
        }
    });

    if (elements.length > 1) {
        elements[0].classList.add('fade-outxx');
        elements[0].addEventListener('animationend', (e) => {
            if (e.animationName == 'fade-outxx') {
                elements[0].remove();
            }
        });
    }
    // fullMessageLength = getFullMessageLength(messageObject);
    messageStream = messageObject.filtered;
    textStreamContainer = document.querySelector('.message');
    streamText();
}

// // Receive a message from the server
socket.on('message', (logoUrl, username, message, messageDuration) => {
    displayTwitchMessage(logoUrl, username, message);
});
