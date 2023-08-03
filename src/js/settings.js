let resourcesPath = path.join(__dirname, '../config/settings.ini');
let settings = ini.parse(fs.readFileSync(resourcesPath, 'utf-8'));

if (envInfo.env) {
	resourcesPath = path.join(envInfo.path, './settings.ini');
	settings = ini.parse(fs.readFileSync(resourcesPath, 'utf-8'));
}

document.body.querySelector('#installedTTS').addEventListener('change', () => {
	settings.TTS.INTERNAL_TTS_VOICE = installedTTS.selectedIndex;
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
}

function getTwitchSettings() {
	document.body.querySelector('#USE_TWITCH').checked = settings.TWITCH.USE_TWITCH === true ? 1 : 0;
	document.body.querySelector('#TWITCH_CHANNEL_NAME').value = settings.TWITCH.CHANNEL_NAME;
	document.body.querySelector('#TWITCH_USERNAME').value = settings.TWITCH.USERNAME;
	document.body.querySelector('#TWITCH_OAUTH_TOKEN').value = settings.TWITCH.OAUTH_TOKEN;
	document.body.querySelector('#TWITCH_CLIENT_ID').value = settings.TWITCH.CLIENT_ID;
	document.body.querySelector('#TWITCH_CLIENT_SECRET').value = settings.TWITCH.CLIENT_SECRET;
}

const notificationToasts = document.querySelector('#toasts'); // toast messages

function createNotification(message = null, type = null) {
	const notification = document.createElement('div');
	notification.classList.add('toast');
	notification.classList.add(type);
	notification.innerText = message;
	notificationToasts.appendChild(notification);
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

function setTwitchToggle() {
	const toggle = document.getElementById('USE_TWITCH').checked;
	settings.TWITCH.USE_TWITCH = toggle;
	fs.writeFileSync(resourcesPath, ini.stringify(settings));
	const inputs = document.getElementsByClassName('inputTwitch');
	toggleRadio(toggle, inputs);
}

// #region Top bar buttons
document.body.querySelector('#min-button').addEventListener('click', () => {
	ipcRenderer.send('minimize-window');
});

document.body.querySelector('#max-button').addEventListener('click', () => {
	ipcRenderer.send('maximize-window');
});

document.body.querySelector('#close-button').addEventListener('click', (event) => {
	ipcRenderer.send('close-window');
	console.log(event);
});
// #endregion

// #region Notification sound test
document.body.querySelector('#SoundTestButton').addEventListener('click', () => {
	sound.playAudio();
});

// #region Use twitch toggle logic
document.body.querySelector('#USE_TWITCH').addEventListener('click', () => {
	setTwitchToggle();
});

Array.from(ttsSelector.querySelectorAll('[name="voiceService"]')).forEach((node) => {
	node.addEventListener('change', (e) => {
		const { target } = e;

		if (!target) { return; }

		settings.TTS.SELECTED_TTS = target.id;
		fs.writeFileSync(resourcesPath, ini.stringify(settings));

		Array.from(ttsSelector.querySelectorAll('select')).forEach((x) => {
			const element = x;
			if (element !== target.parentElement.previousElementSibling) {
				element.disabled = true;
			} else { element.disabled = false; }
		});
	});
});

// Get the selected TTS
const currentlySelectedTTS = ttsSelector.querySelector(`#${settings.selectedTts}`);

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

module.exports = {
	ini,
	settings,
	getGeneralSettings,
	getTwitchSettings,
	setCustomThemeToggle,
	setTwitchToggle,
};
