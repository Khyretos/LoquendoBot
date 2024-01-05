/* eslint-disable no-unused-vars */
const fs = require('fs');
const ini = require('ini');
const path = require('path'); // get directory path
const axios = require('axios');

const { webFrame, ipcRenderer, shell } = require('electron'); // necessary electron libraries to send data to the app
const io = require('socket.io-client');

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
const twitchEmoteListSavePath =
  main.isPackaged === true ? path.join(resourcesPath, './twitch-emotes.json') : path.join(resourcesPath, './config/twitch-emotes.json');
const betterTtvEmoteListSavePath =
  main.isPackaged === true
    ? path.join(resourcesPath, './betterttv-emotes.json')
    : path.join(resourcesPath, './config/betterttv-emotes.json');

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
const lol = document.body.querySelector('country-flag-emoji-polyfill');

// laod local javascript files
const chat = require(path.join(__dirname, './js/chat'));

const messageTemplates = require(path.join(__dirname, './js/messageTemplates'));
const languageObject = require(path.join(__dirname, './js/languages'));
const logger = require(path.join(__dirname, './js/logger'));
const sound = require(path.join(__dirname, './js/sound'));
const config = require(path.join(__dirname, './js/settings'));

const mediaDevices = require(path.join(__dirname, './js/mediaDevices'));

const notificationSounds = path.join(resourcesPath, main.isPackaged ? './sounds/notifications' : '../sounds/notifications');
const sttModels = path.join(resourcesPath, main.isPackaged ? './speech_to_text_models' : '../speech_to_text_models');

function reset() {
  ipcRenderer.send('restart');
}

const server = require(path.join(__dirname, './js/server'));
const backend = require(path.join(__dirname, './js/backend'));
const socket = io(`http://localhost:${settings.GENERAL.PORT}`); // Connect to your Socket.IO server

let twitch = null;
twitch = settings.TWITCH.USE_TWITCH ? require(path.join(__dirname, './js/twitch')) : '';
const Polly = settings.AMAZON.USE_AMAZON ? require(path.join(__dirname, './js/amazon')) : '';
const google = settings.GOOGLE.USE_GOOGLE ? require(path.join(__dirname, './js/google')) : '';

const theme = require(path.join(__dirname, './js/theme'));
const auth = require(path.join(__dirname, './js/auth'));

let ttsRequestCount = 0;
ttsRequestCount = 0;
let customEmojis = [];
customEmojis = [];
let messageId = 0;
messageId = 0;

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

// TODO: refactor obtaining audio devices.
async function getAudioDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput');

  audioOutputDevices.forEach(device => {
    const option1 = document.createElement('option');
    const option2 = document.createElement('option');
    option1.text = device.label || `Output ${device.deviceId}`;
    option2.text = device.label || `Output ${device.deviceId}`;
    option1.value = device.deviceId;
    option2.value = device.deviceId;
    ttsAudioDevices.appendChild(option1);
    notificationSoundAudioDevices.appendChild(option2);
  });

  ttsAudioDevices.selectedIndex = settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE;
  notificationSoundAudioDevices.selectedIndex = settings.AUDIO.SELECTED_NOTIFICATION_AUDIO_DEVICE;
}

getAudioDevices();

function setSelectedLanguageinSelect(languageSelect, language) {
  const button = languageSelect.querySelector('.SmallButton');
  const languageElement = document.createElement('span');
  languageElement.classList = `fi fi-${language.ISO3166} fis pop-selection`;
  languageElement.setAttribute('tip', language.name);
  button.innerHTML = '';
  button.appendChild(languageElement);
  addSingleTooltip(languageElement);
}

function setLanguagesinSelectx(languageSelector, language) {
  const languageSelect = document.querySelector(languageSelector); // obtain the html reference of the google voices comboBox
  const languageSelectContent = languageSelect.querySelector('.pop-content');

  languageSelectContent.addEventListener('click', e => {
    const parent = e.target.parentElement.id;
    language = getLanguageProperties(e.target.getAttribute('value'));

    if (parent === 'SEND_TRANSLATION_IN') {
      settings.LANGUAGE.SEND_TRANSLATION_IN = language.IETF;
    } else {
      settings.LANGUAGE.SEND_TRANSLATION_OUT = language.IETF;
    }

    fs.writeFileSync(settingsPath, ini.stringify(settings));
    setSelectedLanguageinSelect(languageSelect, language);
  });

  for (const language in languageObject.languages) {
    if (Object.prototype.hasOwnProperty.call(languageObject.languages, language)) {
      const IETF = languageObject.languages[language].IETF;
      const ISO639 = languageObject.languages[language].ISO639;
      const ISO3166 = languageObject.languages[language].ISO3166;

      const option = document.createElement('div');
      option.classList = 'language-select';

      const languageElement = document.createElement('span');
      languageElement.classList = `fi fi-${ISO3166} fis`;
      languageElement.style.pointerEvents = 'none';
      option.setAttribute('tip', language);

      const text = document.createElement('span');
      text.style.pointerEvents = 'none';
      text.innerHTML = ` - ${ISO639}`;

      option.setAttribute('value', IETF);

      languageSelectContent.appendChild(option);
      option.appendChild(languageElement);
      option.appendChild(text);
      addSingleTooltip(option);
    }
  }

  setSelectedLanguageinSelect(languageSelect, language);
}

setLanguagesinSelectx('.pop.in', getLanguageProperties(settings.LANGUAGE.SEND_TRANSLATION_IN));
setLanguagesinSelectx('.pop.out', getLanguageProperties(settings.LANGUAGE.SEND_TRANSLATION_OUT));

function setLanguagesinSelect(languageSelector, setting) {
  const languageSelect = document.querySelector(languageSelector); // obtain the html reference of the google voices comboBox

  for (const language in languageObject.languages) {
    if (Object.prototype.hasOwnProperty.call(languageObject.languages, language)) {
      const IETF = languageObject.languages[language].IETF;
      const ISO639 = languageObject.languages[language].ISO639;
      const option = document.createElement('option');

      option.value = IETF;
      option.innerHTML = `${ISO639} : ${language}`;
      languageSelect.appendChild(option);
    }
  }

  languageSelect.selectedIndex = setting;
}

setLanguagesinSelect('#language', settings.GENERAL.LANGUAGE_INDEX);
setLanguagesinSelect('#defaultLanguage', settings.TTS.PRIMARY_TTS_LANGUAGE_INDEX);
setLanguagesinSelect('#secondaryLanguage', settings.TTS.SECONDARY_TTS_LANGUAGE_INDEX);
setLanguagesinSelect('#TRANSLATE_TO', settings.LANGUAGE.TRANSLATE_TO_INDEX);

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

function determineTootlTipPosition(element) {
  const horizontal = document.body.clientWidth / 2;
  const vertical = document.body.clientHeight / 2;

  element.tip.style.left = `${element.mouse.x}px`;
  element.tip.style.top = `${element.mouse.y}px`;

  const tipPosition = element.tip.getBoundingClientRect();

  if (element.position.x < horizontal && element.position.y < vertical) {
    element.tip.style.top = `${parseInt(element.tip.style.top) + 25}px`;
    element.tip.style.left = `${parseInt(element.tip.style.left) + 10}px`;
  }

  if (element.position.x < horizontal && element.position.y > vertical) {
    element.tip.style.top = `${parseInt(element.tip.style.top) - tipPosition.height}px`;
    element.tip.style.left = `${parseInt(element.tip.style.left) + 10}px`;
  }

  if (element.position.x > horizontal && element.position.y < vertical) {
    element.tip.style.top = `${parseInt(element.tip.style.top) + 25}px`;
    element.tip.style.left = `${parseInt(element.tip.style.left) - tipPosition.width}px`;
  }

  if (element.position.x > horizontal && element.position.y > vertical) {
    element.tip.style.top = `${parseInt(element.tip.style.top) - tipPosition.height}px`;
    element.tip.style.left = `${parseInt(element.tip.style.left) - tipPosition.width}px`;
  }

  element.tip.style.visibility = 'visible';
}

// Small tooltip
function addSingleTooltip(el) {
  const tip = document.createElement('div');
  const body = document.querySelector('.container');
  const element = el;
  tip.classList.add('tooltip');
  tip.innerText = el.getAttribute('tip');
  if (el.src) {
    const image = document.createElement('img');
    image.src = el.src;
    tip.appendChild(image);
  }
  body.appendChild(tip);
  tip.pointerEvents = 'none';
  element.onmousemove = e => {
    determineTootlTipPosition({
      position: element.getBoundingClientRect(),
      mouse: { x: e.x, y: e.y },
      tip
    });
  };
  element.onmouseleave = e => {
    tip.style.visibility = 'hidden';
  };
}

Array.from(document.body.querySelectorAll('[tip]')).forEach(el => {
  addSingleTooltip(el);
});

function showChatMessage(article) {
  if (article !== undefined) {
    document.querySelector('#chatBox').appendChild(article);
  }

  const messages = document.body.querySelectorAll('.msg-container');

  const lastMessage = messages[messages.length - 1];
  lastMessage.scrollIntoView({ block: 'end', behavior: 'smooth' });
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

// TODO: refactor
let twitchEmotes = null;
if (fs.existsSync(twitchEmoteListSavePath)) {
  const xxx = fs.readFileSync(twitchEmoteListSavePath);
  twitchEmotes = JSON.parse(xxx);
  emojiPicker.customEmoji = [...twitchEmotes];
}
let betterTtvEmotes = null;
if (fs.existsSync(betterTtvEmoteListSavePath)) {
  const xxx = fs.readFileSync(betterTtvEmoteListSavePath);
  betterTtvEmotes = JSON.parse(xxx);
  emojiPicker.customEmoji = [...betterTtvEmotes];
}

if (twitchEmotes && betterTtvEmotes) {
  emojiPicker.customEmoji = [...twitchEmotes, ...betterTtvEmotes];
}

function getLanguageProperties(languageToDetect) {
  try {
    const filteredLanguage = Object.keys(languageObject.languages).reduce(function (accumulator, currentValue) {
      if (
        languageObject.languages[currentValue].IETF === languageToDetect ||
        languageObject.languages[currentValue].ISO639 === languageToDetect ||
        languageObject.languages[currentValue].ISO3166 === languageToDetect
      ) {
        accumulator[currentValue] = languageObject.languages[currentValue];
      }
      return accumulator;
    }, {});

    const language = {
      name: Object.getOwnPropertyNames(filteredLanguage)[0],
      ISO3166: filteredLanguage[Object.keys(filteredLanguage)[0]].ISO3166,
      ISO639: filteredLanguage[Object.keys(filteredLanguage)[0]].ISO639,
      IETF: filteredLanguage[Object.keys(filteredLanguage)[0]].IETF
    };

    return language;
  } catch (e) {
    // console.error(error);
    return 'error';
  }
}
