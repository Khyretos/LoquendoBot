/* global client, fs, main, path, resourcesPath, customEmojis, emojiPicker, settings, options, sound, showChatMessage, messageTemplates, getPostTime */

const tmi = require('tmi.js');
const axios = require('axios');

let client = null;
let logoUrl = null;
const twitchChannels = [];

function sendMessage(message) {
  client.say(settings.TWITCH.CHANNEL_NAME, message).catch(console.error);
}

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

function displayTwitchMessage(logoUrl, username, messageObject, fileteredMessage) {
  const article = document.createElement('article');
  article.className = 'msg-container sender';

  article.innerHTML = messageTemplates.twitchTemplate;

  const userImg = article.querySelector('.user-img');
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

  article.appendChild(postTime);

  const msg = article.querySelector('.msg-box');
  if (msg) {
    messageObject.forEach(entry => {
      if (entry.text) {
        msg.innerHTML += entry.text;
      } else {
        msg.innerHTML += entry.html;
      }
    });
  }

  // Appends the message to the main chat box (shows the message)
  showChatMessage(article);

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
    headers: { 'Client-ID': settings.TWITCH.CLIENT_ID, Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}` }
  };

  axios
    .request(options)
    .then(responseLogoUrl => {
      logoUrl = responseLogoUrl.data.data[0].profile_image_url;
      displayTwitchMessage(logoUrl, username, message, fileteredMessage);
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

async function formatGlobalTwitchEmotes(emotes, name) {
  for (const emote of emotes) {
    const emojiToBeAdded = {
      name: emote.name,
      shortcodes: [emote.name],
      url: emote.images.url_1x,
      category: name
    };
    await customEmojis.push(emojiToBeAdded);
  }
  emojiPicker.customEmoji = customEmojis;
  saveTwitchEmotesToFile(customEmojis);
}

function formatFollowedChannelsTwitchEmotes(channel) {
  if (channel.emotes.length === 0) {
    return;
  }

  channel.emotes.forEach(emote => {
    if (emote.emote_type === 'bitstier') {
      return;
    }
    if (emote.emote_type === 'subscriptions' && parseInt(channel.tier) < parseInt(emote.tier)) {
      return;
    }
    if (emote.emote_type === 'follower ' && parseInt(channel.tier) === '0') {
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

function getTwitchChannelFollows(paginationToken) {
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
        twitchChannels.push({ broadcaster_id: channel.broadcaster_id, broadcaster_name: channel.broadcaster_name, tier: '0' });
      });

      if (Object.keys(responseLogoUrl.data.pagination).length !== 0) {
        getTwitchChannelFollows(responseLogoUrl.data.pagination.cursor);
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
        // console.log(responseLogoUrl);
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
      // console.log(channel.broadcaster_id);
      if (channel.broadcaster_id === '98553286') {
        // console.log(responseLogoUrl);
        // console.log(channel);
      }
      if (responseLogoUrl.data.data.length !== 0) {
        channel.emotes = responseLogoUrl.data.data;
        formatFollowedChannelsTwitchEmotes(channel);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function getTwitchGLobalEmotes() {
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
      formatGlobalTwitchEmotes(responseLogoUrl.data.data, 'Twitch Global');
      // console.log(responseLogoUrl);
    })
    .catch(error => {
      console.error(error);
    });
}

function getCurrentTwitchChannelId(channelId) {
  let channel = {};
  options = {
    method: 'GET',
    url: `https://api.twitch.tv/helix/users?${channelId !== undefined ? 'id=' + channelId : 'login=' + settings.TWITCH.CHANNEL_NAME}`,
    headers: {
      'Client-ID': settings.TWITCH.CLIENT_ID,
      Authorization: `Bearer ${settings.TWITCH.OAUTH_TOKEN}`
    }
  };

  axios
    .request(options)
    .then(responseData => {
      // console.log(responseData);
      channel = { broadcaster_id: responseData.data.data[0].id, broadcaster_name: responseData.data.data[0].display_name, tier: '0' };
      if (responseData.data.data[0].id !== settings.TWITCH.USER_ID) {
        getCurrentTwitchChannelId(settings.TWITCH.USER_ID);
        channel.tier = '0';
      } else {
        channel.tier = '3000';
      }
      getTwitchChannelEmotes(channel);
    })
    .catch(error => {
      console.error(error);
    });
}

async function getUserAvailableTwitchEmotes() {
  if (settings.TWITCH.OAUTH_TOKEN) {
    await getTwitchGLobalEmotes();
    await getTwitchChannelFollows();
    await getCurrentTwitchChannelId();
  }
}

module.exports = { sendMessage, ping, client, getUserAvailableTwitchEmotes };
