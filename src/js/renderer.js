const fs = require('fs');
const ini = require('ini');
const path = require('path'); // get directory path
const axios = require('axios');

const { ipcRenderer, shell } = require('electron'); // necessary electron libraries to send data to the app
const io = require('socket.io-client');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const GoogleTTS = require('node-google-tts-api');

const tts = new GoogleTTS();
const { Socket } = require('socket.io-client');

const main = ipcRenderer.sendSync('environment');

const resourcesPath = main.resourcesPath;
let settingsPath = main.settingsPath.toString();
let pythonPath = main.pythonPath.toString();
const settings = main.settings;

// TODO: remove gooogle voices txt and use api instead
const googleVoices = fs.readFileSync(path.join(__dirname, './config/googleVoices.txt')).toString().split('\r\n');
// TODO: remove amazon voices txt and use api instead (sakura project has it)
const amazonVoices = fs.readFileSync(path.join(__dirname, './config/amazonVoices.txt')).toString().split('\r\n');

// html elements
const root = document.documentElement;
const ttsSelector = document.body.querySelector('#TTSSelector');
const amazonVoiceSelect = document.querySelector('#amazonVoice'); // obtain the html reference of the amazon voices comboBox
const notificationAudioDevices = document.querySelector('#notificationAudioDevice'); // obtain the html reference of the installedTTS comboBox
const devicesDropdown = document.querySelector('#devicesDropdown');
const notificationSound = document.querySelector('#notification'); // obtain the html reference of the sound comboBox
const sttModel = document.querySelector('#sttModel'); // obtain the html reference of the sound comboBox
const ttsAudioDevices = document.querySelector('#ttsAudioDevice'); // obtain the html reference of the installedTTS comboBox

// laod local javascript files
const chat = require(path.join(__dirname, './js/chat'));

const messageTemplates = require(path.join(__dirname, './js/messageTemplates'));
const languageObject = require(path.join(__dirname, './js/languages'));
const logger = require(path.join(__dirname, './js/logger'));
const sound = require(path.join(__dirname, './js/sound'));
const config = require(path.join(__dirname, './js/settings'));

const mediaDevices = require(path.join(__dirname, './js/mediaDevices'));

let notificationSounds = path.join(__dirname, './sounds/notifications');
let sttModels = path.join(__dirname, '../speech_to_text_models');

function reset() {
    ipcRenderer.send('restart');
}

let server = require(path.join(__dirname, './js/server'));
const backend = require(path.join(__dirname, './js/backend'));
let socket = io(`http://localhost:${settings.GENERAL.PORT}`); // Connect to your Socket.IO server

let twitch = settings.TWITCH.USE_TWITCH ? require(path.join(__dirname, './js/twitch')) : '';
const Polly = settings.AMAZON.USE_AMAZON ? require(path.join(__dirname, './js/amazon')) : '';
const google = settings.GOOGLE.USE_GOOGLE ? require(path.join(__dirname, './js/google')) : '';

const theme = require(path.join(__dirname, './js/theme'));
const auth = require(path.join(__dirname, './js/auth'));

let ttsRequestCount = 0;

// initialize values
config.getGeneralSettings();

const TTSVolume = 1;

const notificationSoundVolume = 1;
const StartDateAndTime = Date.now();
const speakButton = document.querySelector('#speakBtn');

const amazonCredentials = {
    accessKeyId: settings.AMAZON.ACCESS_KEY,
    secretAccessKey: settings.AMAZON.ACCESS_SECRET,
};

// Check for installed sounds
fs.readdir(notificationSounds, (err, files) => {
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
    for (let file of files) {
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
    const audioOutputDevices = devices.filter((device) => device.kind === 'audiooutput');

    audioOutputDevices.forEach((device) => {
        const option = document.createElement('option');
        option.text = device.label || `Output ${device.deviceId}`;
        option.value = device.deviceId;
        ttsAudioDevices.appendChild(option);
    });

    ttsAudioDevices.selectedIndex = settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE;
}

getAudioDevices();

function setLanguagesinSelect(languageSelector, setting) {
    let languageSelect = document.querySelector(languageSelector); // obtain the html reference of the google voices comboBox

    for (const language in languageObject.languages) {
        if (languageObject.languages.hasOwnProperty(language)) {
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
        let ttsService = document.querySelector(select);
        const option = document.createElement('option');
        ttsService.appendChild(option);

        option.value = name;
        option.innerHTML = name;
    }
    addToselect('#primaryTTSService');
    addToselect('#secondaryTTSService');
}

// Small tooltip
Array.from(document.body.querySelectorAll('[tip]')).forEach((el) => {
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
    element.onmousemove = (e) => {
        tip.style.left = `${e.x}px`;
        tip.style.top = `${e.y}px`;
        tip.style.zIndex = 1;
        tip.style.visibility = 'visible';
    };
    element.onmouseleave = (e) => {
        tip.style.visibility = 'hidden';
    };
});

function showChatMessage(article, isUser) {
    document.querySelector('#chatBox').appendChild(article);
    let usernameHtml;
    let msg;
    let messages = Array.from(document.body.querySelectorAll('.msg-container'));

    if (isUser) {
        usernameHtml = article.querySelector('.username-user');
        msg = article.querySelector('.msg-box-user');
    } else {
        usernameHtml = article.querySelector('.username');
        msg = article.querySelector('.msg-box');
    }

    // var style = getComputedStyle(usernameHtml);
    // var style2 = getComputedStyle(usernameHtml);

    const lastMessage = messages[messages.length - 1];
    lastMessage.scrollIntoView({ behavior: 'smooth' });
}

function getPostTime() {
    const date = new Date();
    document.body.querySelectorAll('.container').innerHTML = date.getHours();
    const hours = date.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';
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
