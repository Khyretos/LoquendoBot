const tmi = require('tmi.js');
const axios = require('axios');

const client = new tmi.Client({
	options: {
		skipUpdatingEmotesets: true,
	},
	identity: {
		username: config.settings.TWITCH.USERNAME,
		password: config.settings.TWITCH.OAUTH_TOKEN,
	},
	channels: [config.settings.TWITCH.CHANNEL_NAME],
});

function sendMessage(message) {
	client.say(config.settings.TWITCH.CHANNEL_NAME, message).catch(console.error);
}

client.connect().catch(console.error);

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

	const postTime = article.querySelector('.post-time');
	if (postTime) {
		postTime.innerText = getPostTime();
	}

	const msg = article.querySelector('.msg');
	if (msg) {
		msg.innerHTML = "";

		const messageElement = document.createElement("div");

		messageObject.forEach((entry) => {
			const messageElement = document.createElement("div");
			if (entry.text) {
				messageElement.innerText = entry.text;
				msg.appendChild(messageElement);
			} else {
				messageElement.innerHTML = entry.html;
				msg.appendChild(messageElement);
			}
		})
	}

	// Appends the message to the main chat box (shows the message)
	showChatMessage(article);

	if (fileteredMessage) {
		sound.playVoice(fileteredMessage, logoUrl, username, msg);
	}

	window.article = article;
}

function getProfileImage(userid, username, message, fileteredMessage) {
	// Get Access Token
	let options = {
		method: 'POST',
		url: 'https://id.twitch.tv/oauth2/token',
		data: {
			grant_type: 'client_credentials',
			client_Id: config.settings.TWITCH.CLIENT_ID,
			client_Secret: config.settings.TWITCH.CLIENT_SECRET,
			audience: 'YOUR_API_IDENTIFIER',
		},
	};

	axios.request(options).then((responseAccessToken) => {
		const accessToken = responseAccessToken.data.access_token;

		// Get user Logo with access token
		options = {
			method: 'GET',
			url: `https://api.twitch.tv/helix/users?id=${userid}`,
			headers: { 'Client-ID': config.settings.TWITCH.CLIENT_ID, Authorization: `Bearer ${accessToken}` },
		};

		axios.request(options).then((responseLogoUrl) => {
			const logoUrl = responseLogoUrl.data.data[0].profile_image_url;
			displayTwitchMessage(logoUrl, username, message, fileteredMessage);
		}).catch((error) => {
			console.error(error);
		});
	}).catch((error) => {
		console.error(error);
	});
}

function parseString(inputString) {
	const regex = /(<img.*?\/>)|([^<]+)/g;
	const matches = inputString.match(regex) || [];
	const result = [];

	for (let i = 0; i < matches.length; i++) {
		const match = matches[i].trim();
		if (match.startsWith("<img")) {
			result.push({ html: match });
		} if (match !== '' && !match.startsWith("<img")) {
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
		})
	});

	let messageObject = parseString(emoteMessage)

	sound.playAudio();
	getProfileImage(tags['user-id'], tags['display-name'], messageObject, fileteredMessage);
});


module.exports = { sendMessage };
