/* global client, playNotificationSound, messageId, addSingleTooltip, settingsPath, fs, ini, backend, main, path, resourcesPath, customEmojis, emojiPicker,config, settings, options, sound, showChatMessage, messageTemplates, getPostTime */

const tmi = require('tmi.js');
const axios = require('axios');

let client = null;
let logoUrl = null;
const twitchChannels = [];

function sendMessage(message) {
  client.say(settings.TWITCH.CHANNEL_NAME, message).catch(console.error);
}

if (settings.TWITCH.USERNAME && settings.TWITCH.OAUTH_TOKEN) {
  client = new tmi.Client({
    options: {
      skipUpdatingEmotesets: true
    },
    identity: {
      username: settings.TWITCH.USERNAME,
      password: settings.TWITCH.OAUTH_TOKEN
    },
    channels: [settings.TWITCH.CHANNEL_NAME]
  });

  client
    .connect()
    .then(data => {})
    .catch(console.error);

  client.on('message', (channel, tags, message, self) => {
    if (self) {
      return;
    }
    const emotes = tags.emotes || {};
    const emoteValues = Object.entries(emotes);
    let filteredMessage = message;
    let emoteMessage = message;

    emoteValues.forEach(entry => {
      entry[1].forEach(lol => {
        const [start, end] = lol.split('-');
        const emote = `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${entry[0]}/default/dark/1.0"/>`;
        emoteMessage = emoteMessage.replaceAll(message.slice(parseInt(start), parseInt(end) + 1), emote);
        filteredMessage = filteredMessage.replaceAll(message.slice(parseInt(start), parseInt(end) + 1), '');
      });
    });

    const messageObject = parseString(emoteMessage);

    getProfileImage(tags['user-id'], tags['display-name'], messageObject, filteredMessage);
  });
}

function checkIfTokenIsValid() {
  options = {
    method: 'GET',
    url: 'https://id.twitch.tv/oauth2/validate',
    headers: {
      Authorization: `OAuth ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(response => {
      document.getElementById('TWITCH_CHANNEL_NAME').disabled = false;
    })
    .catch(error => {
      console.error(error);
      document.getElementById('TWITCH_CHANNEL_NAME').disabled = true;
      config.createNotification('Oauth Token is invalid, please obtain a new one', 'error');
    });
}

setInterval(checkIfTokenIsValid, 600000);

if (settings.TWITCH.OAUTH_TOKEN) {
  checkIfTokenIsValid();
} else {
  document.getElementById('TWITCH_CHANNEL_NAME').disabled = true;
}

function ping(element) {
  const value = document.body.querySelector(element);

  client
    .ping()
    .then(data => {
      value.classList.add('success');
      value.innerText = 'Success!';
    })
    .catch(e => {
      value.classList.add('error');
      value.innerText = 'Failed!';
    });
}

async function displayTwitchMessage(logoUrl, username, messageObject, filteredMessage) {
  messageId++;
  const article = document.createElement('article');
  article.className = 'msg-container sender';
  article.setAttribute('id', messageId);

  article.innerHTML = messageTemplates.twitchTemplate;
  const userImg = article.querySelector('.user-img');
  if (userImg) {
    userImg.src = logoUrl;
    userImg.setAttribute('tip', '');
  }
  addSingleTooltip(userImg);

  const usernameHtml = article.querySelector('.username');
  if (usernameHtml) {
    usernameHtml.innerText = username;
  }

  const postTime = article.querySelector('.post-time');

  if (postTime) {
    postTime.innerText = getPostTime();
  }

  article.appendChild(postTime);

  const formattedMessage = article.querySelector('.msg-box');
  if (formattedMessage) {
    messageObject.forEach(entry => {
      if (entry.text) {
        formattedMessage.innerHTML += entry.text;
      } else {
        formattedMessage.innerHTML += entry.html;
      }
    });
  }
  if (settings.LANGUAGE.USE_DETECTION) {
    await backend.getDetectedLanguage({ message: filteredMessage, messageId, username, logoUrl, formattedMessage }).then(language => {
      const languageElement = document.createElement('span');
      languageElement.classList = `fi fi-${language.ISO3166} fis language-icon`;
      languageElement.setAttribute('tip', language.name);
      article.appendChild(languageElement);
      addSingleTooltip(languageElement);

      // Appends the message to the main chat box (shows the message)
      showChatMessage(article);

      if (filteredMessage && !settings.LANGUAGE.OUTPUT_TO_TTS) {
        sound.playVoice({
          filteredMessage,
          logoUrl,
          username,
          formattedMessage,
          language: { selectedLanguage: null, detectedLanguage: language }
        });
      }

      window.article = article;
    });
  } else {
    showChatMessage(article);

    if (filteredMessage) {
      sound.playVoice({ filteredMessage, logoUrl, username, formattedMessage });
    }

    window.article = article;
  }

  sound.playNotificationSound();
}

function getProfileImage(userid, username, message, filteredMessage) {
  // Get user Logo with access token
  options = {
    method: 'GET',
    url: `https://api.twitch.tv/helix/users?id=${userid}`,
    headers: { 'Client-ID': settings.TWITCH.CLIENT_ID, Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}` }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      logoUrl = responseLogoUrl.data.data[0].profile_image_url;
      displayTwitchMessage(logoUrl, username, message, filteredMessage);
    })
    .catch(error => {
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

function saveTwitchEmotesToFile(TwitchEmotes) {
  const data = JSON.stringify(TwitchEmotes);
  const savePath =
    main.isPackaged === true ? path.join(resourcesPath, './twitch-emotes.json') : path.join(resourcesPath, './config/twitch-emotes.json');
  // console.log(savePath);
  fs.writeFile(savePath, data, error => {
    // throwing the error
    // in case of a writing problem
    if (error) {
      // logging the error
      console.error(error);

      throw error;
    }

    // console.log('twitch-emotes.json written correctly');
  });
}

function formatTwitchEmotes(channel) {
  if (channel.emotes.length === 0) {
    return;
  }

  channel.emotes.forEach(emote => {
    if (channel.name !== 'Twitch Global' && emote.emote_type === 'bitstier') {
      return;
    }
    if (channel.name !== 'Twitch Global' && emote.emote_type === 'subscriptions' && parseInt(channel.tier) < parseInt(emote.tier)) {
      return;
    }
    if (channel.name !== 'Twitch Global' && emote.emote_type === 'follower ' && parseInt(channel.tier) === 0) {
      return;
    }
    const emojiToBeAdded = {
      name: emote.name,
      shortcodes: [emote.name],
      url: emote.images.url_1x,
      category: channel.broadcaster_name
    };
    customEmojis.push(emojiToBeAdded);
  });
  emojiPicker.customEmoji = customEmojis;
  saveTwitchEmotesToFile(customEmojis);
}

function getTwitchUserFollows(paginationToken) {
  let url = '';
  if (!paginationToken) {
    url = `https://api.twitch.tv/helix/channels/followed?user_id=${settings.TWITCH.USER_ID}&first=100`;
  } else {
    url = `https://api.twitch.tv/helix/channels/followed?user_id=${settings.TWITCH.USER_ID}&after=${paginationToken}`;
  }
  options = {
    method: 'GET',
    url: url,
    headers: {
      'Client-ID': settings.TWITCH.CLIENT_ID,
      Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      // console.log(responseLogoUrl);

      responseLogoUrl.data.data.forEach(channel => {
        twitchChannels.push({
          broadcaster_id: channel.broadcaster_id,
          broadcaster_name: channel.broadcaster_name,
          tier: '0'
        });
      });

      if (Object.keys(responseLogoUrl.data.pagination).length !== 0) {
        getTwitchUserFollows(responseLogoUrl.data.pagination.cursor);
      } else {
        getTwitchChannelSubscriptions(twitchChannels);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function getTwitchChannelSubscriptions(channels) {
  channels.forEach(channel => {
    options = {
      method: 'GET',
      url: `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${channel.broadcaster_id}&user_id=${settings.TWITCH.USER_ID}`,
      headers: {
        'Client-ID': settings.TWITCH.CLIENT_ID,
        Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
      }
    };

    axios
      .request(options)
      .then(responseLogoUrl => {
        const objIndex = twitchChannels.findIndex(obj => obj.broadcaster_id === channel.broadcaster_id);
        twitchChannels[objIndex].tier = responseLogoUrl.data.data[0].tier;
        getTwitchChannelEmotes(channel);
      })
      .catch(error => {
        if (error.response.status !== 404) {
          console.error(error);
        }
      });
  });
}

function getTwitchChannelEmotes(channel) {
  // Get user Logo with access token
  options = {
    method: 'GET',
    url: `https://api.twitch.tv/helix/chat/emotes?broadcaster_id=${channel.broadcaster_id}`,
    headers: {
      'Client-ID': settings.TWITCH.CLIENT_ID,
      Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      if (responseLogoUrl.data.data.length !== 0) {
        channel.emotes = responseLogoUrl.data.data;
        formatTwitchEmotes(channel);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function getTwitchGlobalEmotes() {
  // Get user Logo with access token
  options = {
    method: 'GET',
    url: 'https://api.twitch.tv/helix/chat/emotes/global',
    headers: {
      'Client-ID': settings.TWITCH.CLIENT_ID,
      Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      formatTwitchEmotes({ broadcaster_name: 'Twitch Global', emotes: responseLogoUrl.data.data });
    })
    .catch(error => {
      console.error(error);
    });
}

async function getUserAvailableTwitchEmotes() {
  if (settings.TWITCH.OAUTH_TOKEN) {
    await getTwitchGlobalEmotes();
    await getTwitchUserFollows();
    await getTwitchChannelEmotes({
      broadcaster_id: settings.TWITCH.USER_ID,
      broadcaster_name: settings.TWITCH.USERNAME,
      tier: '3000'
    });
    await getTwitchChannelEmotes({
      broadcaster_id: settings.TWITCH.CHANNEL_USER_ID,
      broadcaster_name: settings.TWITCH.CHANNEL_NAME,
      tier: '1'
    });
  }
}

function getTwitchChannelId() {
  options = {
    method: 'GET',
    url: `https://api.twitch.tv/helix/users?login=${settings.TWITCH.CHANNEL_NAME}`,
    headers: {
      'Client-ID': settings.TWITCH.CLIENT_ID,
      Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      settings.TWITCH.CHANNEL_USER_ID = responseLogoUrl.data.data[0].id;
      fs.writeFileSync(settingsPath, ini.stringify(settings));
      config.createNotification('Obtained channel info succesfully', 'success');
      getUserAvailableTwitchEmotes();
    })
    .catch(error => {
      console.error(error);
      config.createNotification('could not obtain channel info, please try again', 'error');
    });
}

function getTwitchUserId() {
  // Get user Logo with access token
  options = {
    method: 'GET',
    url: 'https://api.twitch.tv/helix/users',
    headers: {
      'Client-ID': settings.TWITCH.CLIENT_ID,
      Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      // console.log(responseLogoUrl.data.data[0]);
      settings.TWITCH.USERNAME = responseLogoUrl.data.data[0].display_name;
      settings.TWITCH.USER_LOGO_URL = responseLogoUrl.data.data[0].profile_image_url;
      settings.TWITCH.USER_ID = responseLogoUrl.data.data[0].id;
      fs.writeFileSync(settingsPath, ini.stringify(settings));
      config.createNotification('Obtained user info succesfully', 'success');
    })
    .catch(error => {
      console.error(error);
      config.createNotification('could not obtain user info, please try again', 'error');
    });
}

// const Sockette = require('sockette');

// const ws = new Sockette('wss://eventsub.wss.twitch.tv/ws', {
//   timeout: 5e3,
//   maxAttempts: 10,
//   onopen: e => console.log('Connected!', e),
//   onmessage: e => console.log('Received:', e),
//   onreconnect: e => console.log('Reconnecting...', e),
//   onmaximum: e => console.log('Stop Attempting!', e),
//   onclose: e => console.log('Closed!', e),
//   onerror: e => console.log('Error:', e)
// });

// ws.send('Hello, world!');
// ws.json({ type: 'ping' });
// ws.close(); // graceful shutdown

// Reconnect 10s later
// setTimeout(ws.reconnect, 10e3);

module.exports = { sendMessage, ping, client, getUserAvailableTwitchEmotes, getTwitchChannelId, getTwitchUserId, checkIfTokenIsValid };
