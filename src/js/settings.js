let resourcesPath = path.join(__dirname, '../config/settings.ini');
let settings = ini.parse(fs.readFileSync(resourcesPath, 'utf-8'));

if (envInfo.env) {
	resourcesPath = path.join(envInfo.path, './settings.ini');
	settings = ini.parse(fs.readFileSync(resourcesPath, 'utf-8'));
}

document.body.querySelector('#primaryVoice').addEventListener('change', () => {
	var select = document.querySelector("#primaryVoice");
	settings.TTS.PRIMARY_TTS_VOICE = select.selectedIndex;
	settings.TTS.PRIMARY_TTS_NAME = select.options[select.selectedIndex].text;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#primaryLanguage').addEventListener('change', () => {
	var select = document.querySelector("#primaryLanguage");
	settings.TTS.PRIMARY_TTS_LANGUAGE_INDEX = select.selectedIndex;
	settings.TTS.PRIMARY_TTS_LANGUAGE = select.options[select.selectedIndex].text;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#secondaryVoice').addEventListener('change', () => {
	var select = document.querySelector("#secondaryVoice");
	settings.TTS.SECONDARY_TTS_VOICE = select.selectedIndex;
	settings.TTS.SECONDARY_TTS_NAME = select.options[select.selectedIndex].text;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#secondaryLanguage').addEventListener('change', () => {
	var select = document.querySelector("#secondaryLanguage");
	settings.TTS.SECONDARY_TTS_LANGUAGE_INDEX = select.selectedIndex;
	settings.TTS.SECONDARY_TTS_LANGUAGE = select.options[select.selectedIndex].text;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#ttsAudioDevice').addEventListener('change', () => {
	settings.AUDIO.TTS_AUDIO_DEVICE = ttsAudioDevices.value;
	settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE = ttsAudioDevices.selectedIndex;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#TWITCH_CHANNEL_NAME').addEventListener('change', () => {
	settings.TWITCH.CHANNEL_NAME = document.body.querySelector('#TWITCH_CHANNEL_NAME').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#TWITCH_USERNAME').addEventListener('change', () => {
	settings.TWITCH.USERNAME = document.body.querySelector('#TWITCH_USERNAME').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#TWITCH_OAUTH_TOKEN').addEventListener('change', () => {
	settings.TWITCH.OAUTH_TOKEN = document.body.querySelector('#TWITCH_OAUTH_TOKEN').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#TWITCH_CLIENT_ID').addEventListener('change', () => {
	settings.TWITCH.CLIENT_ID = document.body.querySelector('#TWITCH_CLIENT_ID').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#TWITCH_CLIENT_SECRET').addEventListener('change', () => {
	settings.TWITCH.CLIENT_SECRET = document.body.querySelector('#TWITCH_CLIENT_SECRET').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#PORT').addEventListener('change', () => {
	settings.SERVER.PORT = document.body.querySelector('#PORT').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#AMAZON_ACCESS_KEY').addEventListener('change', () => {
	settings.AMAZON.ACCESS_KEY = document.body.querySelector('#AMAZON_ACCESS_KEY').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#AMAZON_ACCESS_SECRET').addEventListener('change', () => {
	settings.AMAZON.ACCESS_SECRET = document.body.querySelector('#AMAZON_ACCESS_SECRET').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

document.body.querySelector('#GOOGLE_API_KEY').addEventListener('change', () => {
	settings.GOOGLE.API_KEY = document.body.querySelector('#GOOGLE_API_KEY').value;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

// document.body.querySelector('#sliderX').addEventListener('change', () => {
// 	// TODO: resolve volume control of TTS
// 	config.SETTINGS.VOICE_VOLUME;
// 	fs.writeFileSync(path.join(__dirname, '/public/config/settings.ini'), ini.stringify(config));
// });

// #region Test/change/Save Configuration
document.body.querySelector('#notification').addEventListener('change', () => {
	settings.AUDIO.NOTIFICATION_SOUND = notificationSound.selectedIndex;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

// document.body.querySelector('#slider').addEventListener('change', () => {
// settings.SETTINGS.NOTIFICATION_VOLUME = parseInt(document.getElementById('SoundVolume').
// innerText);
// fs.writeFileSync(path.join(__dirname, '/public/config/settings.ini'), ini.stringify(settings));
// });

function getGeneralSettings() {
	// Theme
	document.querySelector('#USE_CUSTOM_THEME').value = settings.THEME.USE_CUSTOM_THEME;
	const USE_CUSTOM_THEME = settings.THEME.USE_CUSTOM_THEME;

	document.body.querySelector('#USE_CUSTOM_THEME').checked = settings.THEME.USE_CUSTOM_THEME === true ? 1 : 0;
	theme.setTheme(USE_CUSTOM_THEME);

	// Twitch
	document.body.querySelector('#USE_TWITCH').checked = settings.TWITCH.USE_TWITCH;
	document.body.querySelector('#TWITCH_CHANNEL_NAME').value = settings.TWITCH.CHANNEL_NAME;
	document.body.querySelector('#TWITCH_USERNAME').value = settings.TWITCH.USERNAME;
	document.body.querySelector('#TWITCH_OAUTH_TOKEN').value = settings.TWITCH.OAUTH_TOKEN;
	document.body.querySelector('#TWITCH_CLIENT_ID').value = settings.TWITCH.CLIENT_ID;
	document.body.querySelector('#TWITCH_CLIENT_SECRET').value = settings.TWITCH.CLIENT_SECRET;

	// Server
	document.body.querySelector('#USE_SERVER').checked = settings.SERVER.USE_SERVER;
	document.body.querySelector('#PORT').value = settings.SERVER.PORT;
	document.body.querySelector('#USE_VTUBER').checked = settings.SERVER.USE_VTUBER;
	showMenuButton("#btnBrowsersourceVtuber", settings.SERVER.USE_VTUBER)
	document.body.querySelector('#USE_CHATBUBBLE').checked = settings.SERVER.USE_CHATBUBBLE;
	showMenuButton("#btnBrowsersourceChat", settings.SERVER.USE_CHATBUBBLE)

	// Amazon
	document.body.querySelector('#USE_AMAZON').checked = settings.AMAZON.USE_AMAZON;
	document.body.querySelector('#AMAZON_ACCESS_KEY').value = settings.AMAZON.ACCESS_KEY;
	document.body.querySelector('#AMAZON_ACCESS_SECRET').value = settings.AMAZON.ACCESS_SECRET;

	// Google
	document.body.querySelector('#USE_GOOGLE').checked = settings.GOOGLE.USE_GOOGLE;
	document.body.querySelector('#GOOGLE_API_KEY').value = settings.GOOGLE.API_KEY;

}

function showMenuButton(menuButton, toggle) {
	let option = document.body.querySelector(menuButton);
	if (!toggle) {
		option.style.display = "none";
	} else {
		option.style.display = "";
	}
}

const notificationToasts = document.querySelector('#toasts'); // toast messages

function createNotification(message = null, type = null) {
	const notification = document.createElement('div');
	notification.classList.add('toast');
	notification.classList.add(type);
	notification.innerText = message;
	notificationToasts.appendChild(notification);
	let notfication = undefined;

	let alertSound = "info.mp3";
	if (type === "error") {
		alertSound = "error.mp3";
	}

	if (envInfo.env) {
		notfication = new Audio(path.join(envInfo.path, `./sounds/notifications/${alertSound}`));
	} else {
		notfication = new Audio(path.join(__dirname, `../sounds/notifications/${alertSound}`));
	}
	notfication.play();
	setTimeout(() => notification.remove(), 10000);
}

// Check for configs
if (!settings.TWITCH.USE_TWITCH) {
	const text = 'Please setup a service to connect to in Configuration > Show Advanced';
	createNotification(text, 'warning');
}

if (settings.TWITCH.USE_TWITCH && !settings.TWITCH.CHANNEL_NAME) {
	const text = 'No channel name inserted in the Twitch service';
	createNotification(text, 'alert');
}

if (settings.TWITCH.USE_TWITCH && !settings.TWITCH.USERNAME) {
	const text = 'No username inserted in the Twitch service';
	createNotification(text, 'alert');
}

function toggleRadio(toggle, inputs) {
	const element = inputs;
	if (toggle === true) {
		for (let i = 0; i < inputs.length; i += 1) { element[i].disabled = false; }
	} else {
		for (let i = 0; i < inputs.length; i += 1) { element[i].disabled = true; }
	}
}

function setCustomThemeToggle() {
	const toggle = document.getElementById('USE_CUSTOM_THEME').checked;
	const inputs = document.getElementsByClassName('inputTheme');
	toggleRadio(toggle, inputs);
	theme.setTheme(toggle);
}

// #region Use Custom theme toggle logic
document.body.querySelector('#USE_CUSTOM_THEME').addEventListener('click', () => {
	setCustomThemeToggle();

	const toggle = document.getElementById('USE_CUSTOM_THEME').checked;
	settings.THEME.USE_CUSTOM_THEME = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
});

// #region Top bar buttons
document.body.querySelector('#min-button').addEventListener('click', () => {
	ipcRenderer.send('minimize-window');
});

document.body.querySelector('#max-button').addEventListener('click', () => {
	ipcRenderer.send('maximize-window');
});

document.body.querySelector('#close-button').addEventListener('click', (event) => {
	ipcRenderer.send('close-window');
});
// #endregion

// #region Notification sound test
document.body.querySelector('#SoundTestButton').addEventListener('click', () => {
	sound.playAudio();
});

function toggleTwitch() {
	const toggle = settings.TWITCH.USE_TWITCH;
	const inputs = document.getElementsByClassName('inputTwitch');
	toggleRadio(toggle, inputs);
}

document.body.querySelector('#USE_TWITCH').addEventListener('click', () => {
	const toggle = document.getElementById('USE_TWITCH').checked;
	settings.TWITCH.USE_TWITCH = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	const inputs = document.getElementsByClassName('inputTwitch');
	toggleRadio(toggle, inputs);
});

toggleTwitch();

function toggleGoogle() {
	const toggle = settings.GOOGLE.USE_GOOGLE;
	const inputs = document.getElementsByClassName('inputGoogle');
	toggleRadio(toggle, inputs);
}

document.body.querySelector('#USE_GOOGLE').addEventListener('click', () => {
	const toggle = document.getElementById('USE_GOOGLE').checked;
	settings.GOOGLE.USE_GOOGLE = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	const inputs = document.getElementsByClassName('inputGoogle');
	toggleRadio(toggle, inputs);
});

toggleGoogle();

function toggleAmazon() {
	const toggle = settings.AMAZON.USE_AMAZON;
	const inputs = document.getElementsByClassName('inputAmazon');
	toggleRadio(toggle, inputs);
}

document.body.querySelector('#USE_AMAZON').addEventListener('click', () => {
	const toggle = document.getElementById('USE_AMAZON').checked;
	settings.AMAZON.USE_AMAZON = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	const inputs = document.getElementsByClassName('inputAmazon');
	toggleRadio(toggle, inputs);
});

toggleAmazon();

function toggleServer() {
	const toggle = settings.SERVER.USE_SERVER;
	const inputs = document.getElementsByClassName('inputServer');
	toggleRadio(toggle, inputs);
}

document.body.querySelector('#USE_SERVER').addEventListener('click', () => {
	const toggle = document.getElementById('USE_SERVER').checked;
	settings.SERVER.USE_SERVER = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	const inputs = document.getElementsByClassName('inputServer');
	toggleRadio(toggle, inputs);
});

toggleServer();

document.body.querySelector('#USE_VTUBER').addEventListener('change', () => {
	const toggle = document.getElementById('USE_VTUBER').checked;
	settings.SERVER.USE_VTUBER = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	showMenuButton("#btnBrowsersourceVtuber", toggle);
});

document.body.querySelector('#USE_CHATBUBBLE').addEventListener('change', () => {
	const toggle = document.getElementById('USE_CHATBUBBLE').checked;
	settings.SERVER.USE_CHATBUBBLE = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	showMenuButton("#btnBrowsersourceChat", toggle);
});

// Get the selected TTS
const currentlySelectedTTS = ttsSelector.querySelector(`#${settings.TTS.SELECTED_TTS}`);

if (currentlySelectedTTS) {
	currentlySelectedTTS.checked = true;

	// Dispatch the event to initialize logic.
	currentlySelectedTTS.dispatchEvent(new Event('change'));
}

document.body.querySelector('#notificationVolumeSlider').addEventListener('change', () => {
	const e = document.querySelector('#notificationVolumeSlider');
	e.style.setProperty('--tiempotemporal', e.value);
	e.style.setProperty('--min', e.min === '' ? '0' : e.min);
	e.style.setProperty('--max', e.max === '' ? '100' : e.max);
	document.querySelector('#notificationVolume').value = e.value;

	e.addEventListener('input', () => {
		e.style.setProperty('--tiempotemporal', e.value);
		document.querySelector('#notificationVolume').value = e.value;
		settings.AUDIO.NOTIFICATION_VOLUME = e.value;
		fs.writeFileSync(resourcesPath, ini.stringify(settings));
	});
});

if (settings.AUDIO.NOTIFICATION_VOLUME) {
	document.querySelector('#notificationVolumeSlider').value = settings.AUDIO.NOTIFICATION_VOLUME;
	document.querySelector('#notificationVolumeSlider').dispatchEvent(new Event('change'));
} else {
	document.querySelector('#notificationVolumeSlider').dispatchEvent(new Event('change', { value: 50 }));
}

document.body.querySelector('#ttsVolumeSlider').addEventListener('change', () => {
	const e = document.querySelector('#ttsVolumeSlider');
	e.style.setProperty('--tiempotemporal', e.value);
	e.style.setProperty('--min', e.min === '' ? '0' : e.min);
	e.style.setProperty('--max', e.max === '' ? '100' : e.max);
	document.querySelector('#ttsVolume').value = e.value;

	e.addEventListener('input', () => {
		e.style.setProperty('--tiempotemporal', e.value);
		document.querySelector('#ttsVolume').value = e.value;
		settings.AUDIO.TTS_VOLUME = e.value;
		fs.writeFileSync(resourcesPath, ini.stringify(settings));
	});
});

if (settings.AUDIO.TTS_VOLUME) {
	document.querySelector('#ttsVolumeSlider').value = settings.AUDIO.TTS_VOLUME;
	document.querySelector('#ttsVolumeSlider').dispatchEvent(new Event('change'));
} else {
	document.querySelector('#ttsVolumeSlider').dispatchEvent(new Event('change', { value: 50 }));
}

document.body.querySelector('.language-selector').addEventListener('click', () => {
	var dropdown = document.body.querySelector('.language-dropdown');
	dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.body.querySelector('.language-dropdown').addEventListener('mouseleave', () => {
	hideDropdown();
});

let languageSelector = document.querySelectorAll(".language-item");
languageSelector.forEach(item => {
	item.addEventListener('click', (event) => {
		const el = event.target;
		// tip.innerText = el.getAttribute('language');
		document.getElementById('selected-language').innerText = el.getAttribute('language');
		document.getElementById('selected-flag').innerText = el.getAttribute('flag');
		hideDropdown();
	});
});

function hideDropdown() {
	var dropdown = document.body.querySelector('.language-dropdown');
	dropdown.style.display = 'none';
}


// let primaryTTSSelector = document.body.querySelector(".optgroup");
// primaryTTSSelector.forEach(item => {
// 	item.addEventListener('hover', (event) => {
// 		console.log(event);
// 		// const optionsElement = document.getElementById(optgroupID);
// 		// optionsElement.style.display = optionsElement.style.display === "none" ? "block" : "none";
// 	});
// });


module.exports = {
	ini,
	settings,
	getGeneralSettings,
	setCustomThemeToggle
};
