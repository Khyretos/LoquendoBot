const fs = require('fs');
const ini = require('ini');
const path = require('path'); // get directory path

const { ipcRenderer } = require('electron'); // necessary electron libraries to send data to the app
const say = require('say');
const request = require('request');
const langdetect = require('langdetect');
const io = require('socket.io-client');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const GoogleTTS = require('node-google-tts-api');

const tts = new GoogleTTS();
const { Socket } = require('socket.io-client');

const main = ipcRenderer.sendSync('environment');

const resourcesPath = main.resourcesPath;
const settingsPath = main.settingsPath.toString();
const settings = main.settings;

// TODO: remove gooogle voices txt and use api instead
const googleVoices = fs.readFileSync(path.join(__dirname, './config/googleVoices.txt')).toString().split('\r\n');
// TODO: remove amazon voices txt and use api instead (sakura project has it)
const amazonVoices = fs.readFileSync(path.join(__dirname, './config/amazonVoices.txt')).toString().split('\r\n');

const languagesObject = fs.readFileSync(path.join(__dirname, './config/languages.txt')).toString().split('\r\n');

// html elements
const root = document.documentElement;
const ttsSelector = document.body.querySelector('#TTSSelector');
const amazonVoiceSelect = document.querySelector('#amazonVoice'); // obtain the html reference of the amazon voices comboBox
const notificationAudioDevices = document.querySelector('#notificationAudioDevice'); // obtain the html reference of the installedTTS comboBox
const devicesDropdown = document.querySelector('#devicesDropdown');
const notificationSound = document.querySelector('#notification'); // obtain the html reference of the sound comboBox
const ttsAudioDevices = document.querySelector('#ttsAudioDevice'); // obtain the html reference of the installedTTS comboBox

// laod local javascript files
const chat = require(path.join(__dirname, './js/chat'));

const messageTemplates = require(path.join(__dirname, './js/messageTemplates'));
const logger = require(path.join(__dirname, './js/logger'));
const sound = require(path.join(__dirname, './js/sound'));
const talk = require(path.join(__dirname, './js/voiceQueue')); // Voice queue system
const config = require(path.join(__dirname, './js/settings'));

let notificationSounds = path.join(__dirname, './sounds/notifications');

function reset() {
    ipcRenderer.send('restart');
}

let server;
let socket;

function setServer() {
    if (!settings.SERVER.USE_SERVER) {
        return;
    }
    server = require(path.join(__dirname, './js/server'));
    socket = io(`http://localhost:${settings.SERVER.PORT}`); // Connect to your Socket.IO server
}

setServer();

let twitch = settings.TWITCH.USE_TWITCH ? require(path.join(__dirname, './js/twitch')) : '';
const Polly = settings.AMAZON.USE_AMAZON ? require(path.join(__dirname, './js/amazon')) : '';
const google = settings.GOOGLE.USE_GOOGLE ? require(path.join(__dirname, './js/google')) : '';

const theme = require(path.join(__dirname, './js/theme'));

// initialize values
config.getGeneralSettings();

const TTSVolume = 1;

const notificationSoundVolume = 1;
// const slider = document.body.querySelector('#slider');
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

async function getAudioDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        // logger.info('enumerateDevices() not supported.');
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

    const languages = Object.keys(languagesObject);
    languages.forEach((language) => {
        const option = document.createElement('option');

        option.value = language;
        option.innerHTML = languagesObject[language];

        languageSelect.appendChild(option);
    });

    languageSelect.selectedIndex = setting;
}

setLanguagesinSelect('#primaryLanguage', settings.TTS.PRIMARY_TTS_LANGUAGE_INDEX);
setLanguagesinSelect('#secondaryLanguage', settings.TTS.SECONDARY_TTS_LANGUAGE_INDEX);

function getInstalledVoices(callback) {
    say.getInstalledVoices((err, voices) => {
        function setVoicesinSelect(voiceSelector) {
            let voiceSelect = document.querySelector(voiceSelector); // obtain the html reference of the google voices comboBox

            const internalTTSHeader = document.createElement('optgroup');
            internalTTSHeader.label = 'Internal TTS';
            voiceSelect.appendChild(internalTTSHeader);

            // const installedTTS = document.querySelector('#installedTTS'); // obtain the html reference of the installedTTS comboBox
            voices.forEach((voice, i) => {
                const option = document.createElement('option');

                option.value = i;
                option.innerHTML = voice;

                // installedTTS.appendChild(option);
                internalTTSHeader.appendChild(option);
            });
        }
        setVoicesinSelect('#primaryVoice');
        setVoicesinSelect('#secondaryVoice');

        callback();
    });
}

function getAmazonVoices(callback) {
    if (!settings.AMAZON.USE_AMAZON) {
        callback();
        return;
    }

    function setVoicesinSelect(voiceSelector) {
        let voiceSelect = document.querySelector(voiceSelector); // obtain the html reference of the google voices comboBox

        const internalTTSHeader = document.createElement('optgroup');
        internalTTSHeader.label = 'Amazon TTS';
        voiceSelect.appendChild(internalTTSHeader);

        const voices = Object.keys(amazonVoices);
        voices.forEach((voice) => {
            const option = document.createElement('option');

            option.value = voice;
            option.innerHTML = amazonVoices[voice];

            internalTTSHeader.appendChild(option);
        });
    }

    setVoicesinSelect('#primaryVoice');
    setVoicesinSelect('#secondaryVoice');

    callback();
}

function getGoogleVoices(callback) {
    if (!settings.GOOGLE.USE_GOOGLE) {
        callback();
        return;
    }

    function setVoicesinSelect(voiceSelector) {
        let voiceSelect = document.querySelector(voiceSelector); // obtain the html reference of the google voices comboBox

        const internalTTSHeader = document.createElement('optgroup');
        internalTTSHeader.label = 'Google TTS';
        voiceSelect.appendChild(internalTTSHeader);

        const googleVoiceSelect = document.querySelector('#googleVoice'); // obtain the html reference of the google voices comboBox
        const voices = Object.keys(googleVoices);
        voices.forEach((voice) => {
            const option = document.createElement('option');
            option.classList.add('option');

            option.value = voice;
            option.innerHTML = googleVoices[voice];

            internalTTSHeader.appendChild(option);
        });
    }
    setVoicesinSelect('#primaryVoice');
    setVoicesinSelect('#secondaryVoice');

    callback();
}

getGoogleVoices(function () {
    getAmazonVoices(function () {
        getInstalledVoices(function () {
            let primaryVoice = document.querySelector('#primaryVoice');
            primaryVoice.selectedIndex = settings.TTS.PRIMARY_TTS_VOICE;

            let secondaryVoice = document.querySelector('#secondaryVoice');
            secondaryVoice.selectedIndex = settings.TTS.SECONDARY_TTS_VOICE;
        });
    });
});

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
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    const time = `${hours}:${minutes}`;

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

// Amazon TTS
// const polly = new Polly(amazonCredentials);
// const options = {
// 	text: 'Hallo mijn naam is KEES',
// 	voiceId: 'Lotte',
// };

// const fileStream = fs.createWriteStream(path.join(resourcesPath, '/public/sounds/tts/Amazon_audio.mp3'));

// polly.textToSpeech(options, (err, audioStream) => {
// 	if (err) {
// 		return console.warn(err.message);
// 	}
// 	audioStream.pipe(fileStream);
// 	return 1;
// });
