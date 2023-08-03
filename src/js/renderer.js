const path = require('path'); // get directory path
const {
	ipcRenderer,
} = require('electron'); // necessary electron libraries to send data to the app
const say = require('say');
const request = require('request');
const langdetect = require('langdetect');
const io = require('socket.io-client');

const socket = io('http://localhost:9000'); // Connect to your Socket.IO server
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const GoogleTTS = require('node-google-tts-api');

const tts = new GoogleTTS();
const { Socket } = require('socket.io-client');

const ini = require('ini');

let envInfo = (ipcRenderer.sendSync('environment'))

// TODO: remove gooogle voices txt and use api instead
const googleVoices = fs.readFileSync(path.join(__dirname, './config/googleVoices.txt')).toString().split('\r\n');
// TODO: remove amazon voices txt and use api instead (sakura project has it)
const amazonVoices = fs.readFileSync(path.join(__dirname, './config/amazonVoices.txt')).toString().split('\r\n');

// html elements
const root = document.documentElement;
const ttsSelector = document.body.querySelector('#TTSSelector');
const googleVoiceSelect = document.querySelector('#googleVoice'); // obtain the html reference of the google voices comboBox
const amazonVoiceSelect = document.querySelector('#amazonVoice'); // obtain the html reference of the amazon voices comboBox
const installedTTS = document.querySelector('#installedTTS'); // obtain the html reference of the installedTTS comboBox
const ttsAudioDevices = document.querySelector('#ttsAudioDevice'); // obtain the html reference of the installedTTS comboBox
const notificationAudioDevices = document.querySelector('#notificationAudioDevice'); // obtain the html reference of the installedTTS comboBox
const devicesDropdown = document.querySelector('#devicesDropdown');
const notificationSound = document.querySelector('#notification'); // obtain the html reference of the sound comboBox

// laod local javascript files
const chat = require(path.join(__dirname, './js/chat'));

const Polly = require(path.join(__dirname, './js/amazon'));
const messageTemplates = require(path.join(__dirname, './js/messageTemplates'));
const logger = require(path.join(__dirname, './js/logger'));
const sound = require(path.join(__dirname, './js/sound'));
const talk = require(path.join(__dirname, './js/voiceQueue')); // Voice queue system
const config = require(path.join(__dirname, './js/settings'));

let notificationSounds = undefined;
if (envInfo.env) {
	notificationSounds = path.join(envInfo.path, './sounds/notifications');
} else {
	notificationSounds = path.join(__dirname, './sounds/notifications');
}

const server = require(path.join(__dirname, './js/server'));
const theme = require(path.join(__dirname, './js/theme'));
const twitch = require(path.join(__dirname, './js/twitch'));

// initialize values
config.getGeneralSettings();
config.getTwitchSettings();
config.setCustomThemeToggle();
config.setTwitchToggle();

let selectedVoiceIndex;
let selectedEncodingIndex;
let selectedTtsAudioDeviceIndex;
const TTSVolume = 1;

const notificationSoundVolume = 1;
// const slider = document.body.querySelector('#slider');
const StartDateAndTime = Date.now();
const speakButton = document.querySelector('#speakBtn');

const amazonCredentials = {
	accessKeyId: config.settings.AMAZON.ACCESS_KEY,
	secretAccessKey: config.settings.AMAZON.ACCESS_SECRET,
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
	notificationSound.selectedIndex = config.settings.AUDIO.NOTIFICATION_SOUND;
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

	ttsAudioDevices.selectedIndex = config.settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE;
	// devicesDropdown.selectedIndex = 0;

	// Create an audio context
	// audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

getAudioDevices();

say.getInstalledVoices((err, voices) => {
	voices.forEach((voice, i) => {
		const option = document.createElement('option');

		option.value = i;
		option.innerHTML = voice;

		installedTTS.appendChild(option);
	});
	installedTTS.selectedIndex = config.settings.TTS.INTERNAL_TTS_VOICE;
});

async function getGoogleVoices() {
	const voices = Object.keys(googleVoices);
	await voices.forEach((voice) => {
		const option = document.createElement('option');

		option.value = voice;
		option.innerHTML = googleVoices[voice];

		googleVoiceSelect.appendChild(option);
	});
	googleVoiceSelect.selectedIndex = config.settings.TTS.GOOGLE_VOICE;
}

getGoogleVoices();

async function getAmazonVoices() {
	const voices = Object.keys(amazonVoices);
	await voices.forEach((voice) => {
		const option = document.createElement('option');

		option.value = voice;
		option.innerHTML = amazonVoices[voice];

		amazonVoiceSelect.appendChild(option);
	});
	amazonVoiceSelect.selectedIndex = config.settings.TTS.AMAZON_VOICE;
}

getAmazonVoices();

// Small tooltip
Array.from(document.body.querySelectorAll('[tip]')).forEach((el) => {
	const tip = document.createElement('div');
	const element = el;
	tip.classList.add('tooltip');
	tip.innerText = el.getAttribute('tip');
	tip.style.transform = `translate(${el.hasAttribute('tip-left') ? 'calc(-100% - 5px)' : '15px'}, ${el.hasAttribute('tip-top') ? '-100%' : '15px'
		})`;
	element.appendChild(tip);
	element.onmousemove = (e) => {
		tip.style.left = `${e.pageX}px`;
		tip.style.top = `${e.pageY}px`;
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

// Amazon TTS
// const polly = new Polly(amazonCredentials);
// const options = {
// 	text: 'Hallo mijn naam is KEES',
// 	voiceId: 'Lotte',
// };

// const fileStream = fs.createWriteStream(path.join(__dirname, '/public/sounds/tts/Amazon_audio.mp3'));

// polly.textToSpeech(options, (err, audioStream) => {
// 	if (err) {
// 		return console.warn(err.message);
// 	}
// 	audioStream.pipe(fileStream);
// 	return 1;
// });
