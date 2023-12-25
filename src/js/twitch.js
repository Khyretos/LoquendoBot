const tmi = require('tmi.js');
const axios = require('axios');

let client;

function sendMessage(message) {
    client.say(settings.TWITCH.CHANNEL_NAME, message).catch(console.error);
}

client = new tmi.Client({
    options: {
        skipUpdatingEmotesets: true,
    },
    identity: {
        username: settings.TWITCH.USERNAME,
        password: settings.TWITCH.OAUTH_TOKEN,
    },
    channels: [settings.TWITCH.CHANNEL_NAME],
});

client
    .connect()
    .then((data) => {})
    .catch(console.error);

function ping(element) {
    let value = document.body.querySelector(element);

    client
        .ping()
        .then((data) => {
            value.classList.add('success');
            value.innerText = 'Success!';
        })
        .catch((e) => {
            value.classList.add('error');
            value.innerText = 'Failed!';
        });
}

function displayTwitchMessage(logoUrl, username, messageObject, fileteredMessage) {
    const article = document.createElement('article');
    article.className = 'msg-container msg-remote';

    article.innerHTML = messageTemplates.twitchTemplate;

    const userImg = article.querySelector('.icon-container > .user-img');
    if (userImg) {
        userImg.src = logoUrl;
    }

    const usernameHtml = article.querySelector('.username');
    if (usernameHtml) {
        usernameHtml.innerText = username;
    }

    const postTime = document.createElement('span');
    postTime.classList.add('post-time');

    if (postTime) {
        postTime.innerText = getPostTime();
    }

    const iconContainer = article.querySelector('.icon-container');
    iconContainer.appendChild(postTime);

    const msg = article.querySelector('.msg-box');
    if (msg) {
        messageObject.forEach((entry) => {
            if (entry.text) {
                msg.innerHTML += entry.text;
            } else {
                msg.innerHTML += entry.html;
            }
        });
        // msg.appendChild(postTime);
    }

    // Appends the message to the main chat box (shows the message)
    showChatMessage(article, false);

    if (fileteredMessage) {
        sound.playVoice(fileteredMessage, logoUrl, username, msg);
    }

    window.article = article;
}

function getProfileImage(userid, username, message, fileteredMessage) {
    // Get user Logo with access token
    options = {
        method: 'GET',
        url: `https://api.twitch.tv/helix/users?id=${userid}`,
        headers: { 'Client-ID': settings.TWITCH.CLIENT_ID, Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}` },
    };

    axios
        .request(options)
        .then((responseLogoUrl) => {
            const logoUrl = responseLogoUrl.data.data[0].profile_image_url;
            displayTwitchMessage(logoUrl, username, message, fileteredMessage);
        })
        .catch((error) => {
            console.error(error);
        });
}

function parseString(inputString) {
    const regex = /(<img.*?\/>)|([^<]+)/g;
    const matches = inputString.match(regex) || [];
    const result = [];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i].trim();
        if (match.startsWith('<img')) {
            result.push({ html: match });
        }
        if (match !== '' && !match.startsWith('<img')) {
            result.push({ text: match });
        }
    }
    return result;
}

client.on('message', (channel, tags, message, self) => {
    if (self) {
        return;
    }
    const emotes = tags.emotes || {};
    const emoteValues = Object.entries(emotes);
    let fileteredMessage = message;
    let emoteMessage = message;

    emoteValues.forEach((entry) => {
        entry[1].forEach((lol) => {
            const [start, end] = lol.split('-');
            let emote = `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${entry[0]}/default/dark/1.0"/>`;
            emoteMessage = emoteMessage.replaceAll(message.slice(parseInt(start), parseInt(end) + 1), emote);
            fileteredMessage = fileteredMessage.replaceAll(message.slice(parseInt(start), parseInt(end) + 1), '');
        });
    });

    let messageObject = parseString(emoteMessage);
    getProfileImage(tags['user-id'], tags['display-name'], messageObject, fileteredMessage);
});

module.exports = { sendMessage, ping, client };
