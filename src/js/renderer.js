const fs = require('fs');
const ini = require('ini');
const path = require('path'); // get directory path
const axios = require('axios');

const { webFrame, ipcRenderer, shell } = require('electron'); // necessary electron libraries to send data to the app
const io = require('socket.io-client');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const GoogleTTS = require('node-google-tts-api');

const tts = new GoogleTTS();
const { Socket } = require('socket.io-client');

const main = ipcRenderer.sendSync('environment');

const resourcesPath = main.resourcesPath;
const settingsPath = main.settingsPath.toString();
const pythonPath = main.pythonPath.toString();
const settings = main.settings;

// TODO: remove gooogle voices txt and use api instead
const googleVoices = fs.readFileSync(path.join(__dirname, './config/googleVoices.txt')).toString().split('\r\n');
// TODO: remove amazon voices txt and use api instead (sakura project has it)
const amazonVoices = fs.readFileSync(path.join(__dirname, './config/amazonVoices.txt')).toString().split('\r\n');
const emoteListSavePath =
  main.isPackaged === true ? path.join(resourcesPath, './twitch-emotes.json') : path.join(resourcesPath, './config/twitch-emotes.json');

// html elements
const root = document.documentElement;
const ttsSelector = document.body.querySelector('#TTSSelector');
const amazonVoiceSelect = document.querySelector('#amazonVoice'); // obtain the html reference of the amazon voices comboBox
const notificationAudioDevices = document.querySelector('#notificationAudioDevice'); // obtain the html reference of the installedTTS comboBox
const devicesDropdown = document.querySelector('#devicesDropdown');
const notificationSound = document.querySelector('#notification'); // obtain the html reference of the sound comboBox
const sttModel = document.querySelector('#sttModel'); // obtain the html reference of the sound comboBox
const ttsAudioDevices = document.querySelector('#ttsAudioDevice'); // obtain the html reference of the installedTTS comboBox
const notificationSoundAudioDevices = document.querySelector('#notificationSoundAudioDevice'); // obtain the html reference of the installedTTS comboBox
const emojiPicker = document.body.querySelector('emoji-picker');

// laod local javascript files
const chat = require(path.join(__dirname, './js/chat'));

const messageTemplates = require(path.join(__dirname, './js/messageTemplates'));
const languageObject = require(path.join(__dirname, './js/languages'));
const logger = require(path.join(__dirname, './js/logger'));
const sound = require(path.join(__dirname, './js/sound'));
const config = require(path.join(__dirname, './js/settings'));

const mediaDevices = require(path.join(__dirname, './js/mediaDevices'));

const notificationSounds = path.join(__dirname, './sounds/notifications');
const sttModels = path.join(__dirname, '../speech_to_text_models');

function reset() {
  ipcRenderer.send('restart');
}

const server = require(path.join(__dirname, './js/server'));
const backend = require(path.join(__dirname, './js/backend'));
const socket = io(`http://localhost:${settings.GENERAL.PORT}`); // Connect to your Socket.IO server

const twitch = settings.TWITCH.USE_TWITCH ? require(path.join(__dirname, './js/twitch')) : '';
const Polly = settings.AMAZON.USE_AMAZON ? require(path.join(__dirname, './js/amazon')) : '';
const google = settings.GOOGLE.USE_GOOGLE ? require(path.join(__dirname, './js/google')) : '';

const theme = require(path.join(__dirname, './js/theme'));
const auth = require(path.join(__dirname, './js/auth'));

let ttsRequestCount = 0;
ttsRequestCount = 0;
let customEmojis = [];
customEmojis = [];

// initialize values
config.getGeneralSettings();

const TTSVolume = 1;

const notificationSoundVolume = 1;
const StartDateAndTime = Date.now();
const speakButton = document.querySelector('#speakBtn');

const amazonCredentials = {
  accessKeyId: settings.AMAZON.ACCESS_KEY,
  secretAccessKey: settings.AMAZON.ACCESS_SECRET
};

// Check for installed sounds
fs.readdir(notificationSounds, (err, files) => {
  if (err) {
    console.error(err);
  }

  files.forEach((file, i) => {
    // Create a new option element.
    const option = document.createElement('option');

    // Set the options value and text.
    option.value = i;
    option.innerHTML = file;

    // Add the option to the sound selector.
    notificationSound.appendChild(option);
  });

  // set the saved notification sound
  notificationSound.selectedIndex = settings.AUDIO.NOTIFICATION_SOUND;
});

// Check for installed stt models
fs.readdir(sttModels, (err, files) => {
  if (err) {
    console.error(err);
  }

  for (const file of files) {
    if (file.includes('.txt')) {
      continue;
    }
    // Create a new option element.
    const option = document.createElement('option');

    // Set the options value and text.
    option.value = file;
    option.innerHTML = file;

    // Add the option to the sound selector.
    sttModel.appendChild(option);
  }

  // set the saved notification sound
  sttModel.value = settings.STT.LANGUAGE;
});

async function getAudioDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');

  audioOutputDevices.forEach(device => {
    const option = document.createElement('option');
    option.text = device.label || `Output ${device.deviceId}`;
    option.value = device.deviceId;
    ttsAudioDevices.appendChild(option);
    notificationSoundAudioDevices.appendChild(option);
  });

  ttsAudioDevices.selectedIndex = settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE;
  notificationSoundAudioDevices.selectedIndex = settings.AUDIO.SELECTED_NOTIFICATION_AUDIO_DEVICE;
}

getAudioDevices();

function setLanguagesinSelect(languageSelector, setting) {
  const languageSelect = document.querySelector(languageSelector); // obtain the html reference of the google voices comboBox

  for (const language in languageObject.languages) {
    if (Object.prototype.hasOwnProperty.call(languageObject.languages, language)) {
      const iso639 = languageObject.languages[language]['ISO-639'];
      const option = document.createElement('option');
      option.value = iso639;
      option.innerHTML = `${iso639} - ${language}`;
      languageSelect.appendChild(option);
    }
  }

  languageSelect.selectedIndex = setting;
}

setLanguagesinSelect('#language', settings.GENERAL.LANGUAGE);
setLanguagesinSelect('#defaultLanguage', settings.TTS.PRIMARY_TTS_LANGUAGE_INDEX);
setLanguagesinSelect('#secondaryLanguage', settings.TTS.SECONDARY_TTS_LANGUAGE_INDEX);

function addVoiceService(name) {
  function addToselect(select) {
    const ttsService = document.querySelector(select);
    const option = document.createElement('option');
    ttsService.appendChild(option);

    option.value = name;
    option.innerHTML = name;
  }
  addToselect('#primaryTTSService');
  addToselect('#secondaryTTSService');
}

// Small tooltip
Array.from(document.body.querySelectorAll('[tip]')).forEach(el => {
  const tip = document.createElement('div');
  const body = document.querySelector('.container');
  const element = el;
  tip.classList.add('tooltip');
  tip.classList.add('tooltiptext');
  tip.innerText = el.getAttribute('tip');
  tip.style.transform = `translate(${el.hasAttribute('tip-left') ? 'calc(-100% - 5px)' : '15px'}, ${
    el.hasAttribute('tip-top') ? '-100%' : '15px'
  })`;
  body.appendChild(tip);
  element.onmousemove = e => {
    tip.style.left = `${e.x}px`;
    tip.style.top = `${e.y}px`;
    tip.style.zIndex = 1;
    tip.style.visibility = 'visible';
  };
  element.onmouseleave = e => {
    tip.style.visibility = 'hidden';
  };
});

function showChatMessage(article) {
  document.querySelector('#chatBox').appendChild(article);

  const messages = Array.from(document.body.querySelectorAll('.msg-container'));

  const lastMessage = messages[messages.length - 1];
  lastMessage.scrollIntoView({ behavior: 'smooth' });
}

function getPostTime() {
  const date = new Date();
  document.body.querySelectorAll('.container').innerHTML = date.getHours();
  const hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  const time = `${hours}:${minutes} ${ampm}`;

  return time;
}

function showPreviewChatMessage() {
  const message = messageTemplates.messageTemplate;
  document.querySelector('#mini-mid').innerHTML += message;
  const messages = Array.from(document.body.querySelectorAll('#mini-mid'));
  const lastMessage = messages[messages.length - 1];
  lastMessage.scrollIntoView({ behavior: 'smooth' });
}

showPreviewChatMessage();

function hideText(button, field) {
  document.body.querySelector(button).addEventListener('click', () => {
    const passwordInput = document.querySelector(field);
    if (passwordInput.type === 'password') {
      passwordInput.type = 'lol';
    } else {
      passwordInput.type = 'password';
    }
  });
}

hideText('.password-toggle-btn1', '#TWITCH_OAUTH_TOKEN');
hideText('.password-toggle-btn4', '#AMAZON_ACCESS_KEY');
hideText('.password-toggle-btn5', '#AMAZON_ACCESS_SECRET');
hideText('.password-toggle-btn6', '#GOOGLE_API_KEY');

function setZoomLevel(currentZoom, zoomIn) {
  let newZoom = currentZoom.toFixed(2);

  if (zoomIn === true && currentZoom < 4.95) {
    newZoom = (currentZoom + 0.05).toFixed(2);
  }
  if (zoomIn === false && currentZoom > 0.25) {
    newZoom = (currentZoom - 0.05).toFixed(2);
  }

  webFrame.setZoomFactor(parseFloat(newZoom));
  settings.GENERAL.ZOOMLEVEL = newZoom;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  document.body.querySelector('#ZOOMLEVEL').value = (settings.GENERAL.ZOOMLEVEL * 100).toFixed(0);
}

if (fs.existsSync(emoteListSavePath)) {
  fs.readFile(emoteListSavePath, 'utf8', (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    const emotes = JSON.parse(data);
    emojiPicker.customEmoji = emotes;
  });
}
