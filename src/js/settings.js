document.body.querySelector('#primaryVoice').addEventListener('change', () => {
    var select = document.querySelector('#primaryVoice');
    settings.TTS.PRIMARY_TTS_VOICE = select.selectedIndex;
    settings.TTS.PRIMARY_TTS_NAME = select.options[select.selectedIndex].text;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved primary voice!', 'success');
});

document.body.querySelector('#primaryLanguage').addEventListener('change', () => {
    var select = document.querySelector('#primaryLanguage');
    settings.TTS.PRIMARY_TTS_LANGUAGE_INDEX = select.selectedIndex;
    settings.TTS.PRIMARY_TTS_LANGUAGE = select.options[select.selectedIndex].text;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved primary language!', 'success');
});

document.body.querySelector('#secondaryVoice').addEventListener('change', () => {
    var select = document.querySelector('#secondaryVoice');
    settings.TTS.SECONDARY_TTS_VOICE = select.selectedIndex;
    settings.TTS.SECONDARY_TTS_NAME = select.options[select.selectedIndex].text;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved secondary voice!', 'success');
});

document.body.querySelector('#secondaryLanguage').addEventListener('change', () => {
    var select = document.querySelector('#secondaryLanguage');
    settings.TTS.SECONDARY_TTS_LANGUAGE_INDEX = select.selectedIndex;
    settings.TTS.SECONDARY_TTS_LANGUAGE = select.options[select.selectedIndex].text;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved secondary language!', 'success');
});

document.body.querySelector('#ttsAudioDevice').addEventListener('change', () => {
    settings.AUDIO.TTS_AUDIO_DEVICE = ttsAudioDevices.value;
    settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE = ttsAudioDevices.selectedIndex;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved audio device!', 'success');
});

document.body.querySelector('#TWITCH_CHANNEL_NAME').addEventListener('change', () => {
    settings.TWITCH.CHANNEL_NAME = document.body.querySelector('#TWITCH_CHANNEL_NAME').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));

    let button = document.body.querySelector('#TestTwitchCredentials');
    button.className = 'AdvancedMenuButton';
    createNotification('Saved Channel name, please restart the application to reset twitch service', 'warning');
});

document.body.querySelector('#TWITCH_OAUTH_TOKEN').addEventListener('change', () => {
    settings.TWITCH.OAUTH_TOKEN = document.body.querySelector('#TWITCH_OAUTH_TOKEN').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved OAuth token!', 'success');

    let button = document.body.querySelector('#TestTwitchCredentials');
    button.className = 'AdvancedMenuButton';
    createNotification('Saved OAuth token, please restart the application to reset twitch service', 'warning');
});

document.body.querySelector('#PORT').addEventListener('change', () => {
    settings.SERVER.PORT = document.body.querySelector('#PORT').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved port, please restart the application to reset the port', 'warning');
});

document.body.querySelector('#AMAZON_ACCESS_KEY').addEventListener('change', () => {
    settings.AMAZON.ACCESS_KEY = document.body.querySelector('#AMAZON_ACCESS_KEY').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved Amazon access key!', 'success');
});

document.body.querySelector('#AMAZON_ACCESS_SECRET').addEventListener('change', () => {
    settings.AMAZON.ACCESS_SECRET = document.body.querySelector('#AMAZON_ACCESS_SECRET').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved Amazon access secret!', 'success');
});

document.body.querySelector('#GOOGLE_API_KEY').addEventListener('change', () => {
    settings.GOOGLE.API_KEY = document.body.querySelector('#GOOGLE_API_KEY').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved Google api key!', 'success');
});

document.body.querySelector('#notification').addEventListener('change', () => {
    settings.AUDIO.NOTIFICATION_SOUND = notificationSound.selectedIndex;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved notification sound!', 'success');
});

function getGeneralSettings() {
    // Theme
    document.querySelector('#USE_CUSTOM_THEME').value = settings.THEME.USE_CUSTOM_THEME;
    document.body.querySelector('#USE_CUSTOM_THEME').checked = settings.THEME.USE_CUSTOM_THEME === true ? 1 : 0;
    theme.setTheme();

    // TTS
    document.body.querySelector('#USE_TTS').checked = settings.TTS.USE_TTS;

    // Notification sounds
    document.body.querySelector('#USE_NOTIFICATION_SOUNDS').checked = settings.AUDIO.USE_NOTIFICATION_SOUNDS;

    // Twitch
    document.body.querySelector('#USE_TWITCH').checked = settings.TWITCH.USE_TWITCH;
    document.body.querySelector('#TWITCH_CHANNEL_NAME').value = settings.TWITCH.CHANNEL_NAME;
    document.body.querySelector('#TWITCH_OAUTH_TOKEN').value = settings.TWITCH.OAUTH_TOKEN;

    // Server
    document.body.querySelector('#USE_SERVER').checked = settings.SERVER.USE_SERVER;
    document.body.querySelector('#PORT').value = settings.SERVER.PORT;
    document.body.querySelector('#USE_VTUBER').checked = settings.SERVER.USE_VTUBER;
    document.body.querySelector('#VTUBER_URL').value = `http://localhost:${settings.SERVER.PORT}/vtuber/`;
    showMenuButton('#btnBrowsersourceVtuber', settings.SERVER.USE_VTUBER);
    document.body.querySelector('#USE_CHATBUBBLE').checked = settings.SERVER.USE_CHATBUBBLE;
    document.body.querySelector('#CHATBUBBLE_URL').value = `http://localhost:${settings.SERVER.PORT}/chat/`;
    showMenuButton('#btnBrowsersourceChat', settings.SERVER.USE_CHATBUBBLE);

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
        option.style.display = 'none';
    } else {
        option.style.display = '';
    }
}

const notificationToasts = document.querySelector('#toasts'); // toast messages

function createNotification(message = null, type = null) {
    const notification = document.createElement('div');
    notification.classList.add('toast');
    notification.classList.add(type);
    notification.innerText = message;
    notificationToasts.appendChild(notification);

    let alertSound = 'info.mp3';
    if (type === 'error') {
        alertSound = 'error.mp3';
    }

    let notfication = new Audio(path.join(resourcesPath, `./sounds/notifications/${alertSound}`));
    notfication.volume = settings.AUDIO.NOTIFICATION_VOLUME / 100;
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
    createNotification(text, 'warning');
}

if (settings.TWITCH.USE_TWITCH && !settings.TWITCH.USERNAME) {
    const text = 'No username inserted in the Twitch service';
    createNotification(text, 'warning');
}

function toggleRadio(toggle, inputs) {
    const element = inputs;
    if (toggle === true) {
        for (let i = 0; i < inputs.length; i += 1) {
            element[i].style.display = '';
        }
    } else {
        for (let i = 0; i < inputs.length; i += 1) {
            element[i].style.display = 'none';
        }
    }
}

// #region Use Custom theme toggle logic
document.body.querySelector('#USE_CUSTOM_THEME').addEventListener('click', () => {
    const toggle = document.getElementById('USE_CUSTOM_THEME').checked;
    const inputs = document.getElementsByClassName('inputTheme');
    toggleRadio(toggle, inputs);

    settings.THEME.USE_CUSTOM_THEME = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    theme.setTheme();
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} custom theme!`, 'success');
});

// #region Top bar buttons
document.body.querySelector('#min-button').addEventListener('click', () => {
    ipcRenderer.send('minimize-window');
});

// #region Top bar buttons
document.body.querySelector('#Info_USERNAME').addEventListener('click', () => {
    const key = ipcRenderer.sendSync('twitch');

    let element = document.body.querySelector('#TWITCH_OAUTH_TOKEN');
    element.value = key;

    settings.TWITCH.OAUTH_TOKEN = key;

    fs.writeFileSync(settingsPath, ini.stringify(settings));
    createNotification('Saved OAuth token!', 'success');
});

document.body.querySelector('#Info_VTUBER').addEventListener('click', () => {
    ipcRenderer.send('vtuber');
});

document.body.querySelector('#Info_CHATBUBBLE').addEventListener('click', () => {
    ipcRenderer.send('chatBubble');
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
    sound.playNotificationSound();
});

document.body.querySelector('#TestTwitchCredentials').addEventListener('click', () => {
    twitch.ping('#TestTwitchCredentials');
    // resetTwitch(;
});

function toggleTwitch() {
    const toggle = settings.TWITCH.USE_TWITCH;
    const inputs = document.getElementsByClassName('inputTwitch');
    toggleRadio(toggle, inputs);
}

toggleTwitch();

document.body.querySelector('#USE_TWITCH').addEventListener('click', () => {
    const toggle = document.getElementById('USE_TWITCH').checked;
    settings.TWITCH.USE_TWITCH = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    const inputs = document.getElementsByClassName('inputTwitch');
    toggleRadio(toggle, inputs);
    twitch = settings.TWITCH.USE_TWITCH ? require(path.join(__dirname, './twitch')) : null;
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} Twitch settings!`, 'success');
});

function toggleGoogle() {
    const toggle = settings.GOOGLE.USE_GOOGLE;
    const inputs = document.getElementsByClassName('inputGoogle');
    toggleRadio(toggle, inputs);
}

toggleGoogle();

document.body.querySelector('#USE_GOOGLE').addEventListener('click', () => {
    const toggle = document.getElementById('USE_GOOGLE').checked;
    settings.GOOGLE.USE_GOOGLE = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    const inputs = document.getElementsByClassName('inputGoogle');
    toggleRadio(toggle, inputs);
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} Google settings!`, 'success');
});

function toggleAmazon() {
    const toggle = settings.AMAZON.USE_AMAZON;
    const inputs = document.getElementsByClassName('inputAmazon');
    toggleRadio(toggle, inputs);
}

toggleAmazon();

document.body.querySelector('#USE_AMAZON').addEventListener('click', () => {
    const toggle = document.getElementById('USE_AMAZON').checked;
    settings.AMAZON.USE_AMAZON = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    const inputs = document.getElementsByClassName('inputAmazon');
    toggleRadio(toggle, inputs);
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} Amazon settings!`, 'success');
});

function toggleServer() {
    const toggle = settings.SERVER.USE_SERVER;
    const inputs = document.getElementsByClassName('inputServer');
    toggleRadio(toggle, inputs);
}

toggleServer();

document.body.querySelector('#USE_SERVER').addEventListener('click', () => {
    const toggle = document.getElementById('USE_SERVER').checked;
    settings.SERVER.USE_SERVER = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    const inputs = document.getElementsByClassName('inputServer');
    toggleRadio(toggle, inputs);
    setServer();
    createNotification(
        `${toggle ? 'Enabled' : 'Disabled'} server settings!, the service will stop working after restarting the application`,
        'success',
    );
});

document.body.querySelector('#USE_VTUBER').addEventListener('change', () => {
    const toggle = document.getElementById('USE_VTUBER').checked;
    settings.SERVER.USE_VTUBER = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    showMenuButton('#btnBrowsersourceVtuber', toggle);
    createNotification(
        `${toggle ? 'Enabled' : 'Disabled'} Vtuber setting!, the service will stop working after restarting the application`,
        'success',
    );
    server.startVtuber();
});

document.body.querySelector('#USE_CHATBUBBLE').addEventListener('change', () => {
    const toggle = document.getElementById('USE_CHATBUBBLE').checked;
    settings.SERVER.USE_CHATBUBBLE = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    showMenuButton('#btnBrowsersourceChat', toggle);
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} chatbubble setting!`, 'success');
    server.startChatBubble();
});

function toggleTTS() {
    const toggle = settings.TTS.USE_TTS;
    const inputs = document.getElementsByClassName('inputTTS');
    toggleRadio(toggle, inputs);
}

toggleTTS();

document.body.querySelector('#USE_TTS').addEventListener('change', () => {
    const toggle = document.getElementById('USE_TTS').checked;
    settings.TTS.USE_TTS = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    const inputs = document.getElementsByClassName('inputTTS');
    toggleRadio(toggle, inputs);
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} text to speech!`, 'success');
});

function toggleNotificationSounds() {
    const toggle = settings.AUDIO.USE_NOTIFICATION_SOUNDS;
    const inputs = document.getElementsByClassName('inputNotificationSound');
    toggleRadio(toggle, inputs);
}

toggleNotificationSounds();

document.body.querySelector('#USE_NOTIFICATION_SOUNDS').addEventListener('change', () => {
    const toggle = document.getElementById('USE_NOTIFICATION_SOUNDS').checked;
    settings.AUDIO.USE_NOTIFICATION_SOUNDS = toggle;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    const inputs = document.getElementsByClassName('inputNotificationSound');
    toggleRadio(toggle, inputs);
    createNotification(`${toggle ? 'Enabled' : 'Disabled'} notification sounds!`, 'success');
});

document.body.querySelector('#notificationVolume').addEventListener('change', () => {
    let element = document.body.querySelector('#notificationVolume');
    settings.AUDIO.NOTIFICATION_VOLUME = element.value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));

    const slider = document.querySelector('#notificationVolumeSlider');
    slider.value = settings.AUDIO.NOTIFICATION_VOLUME;
    slider.style.setProperty('--tiempotemporal', settings.AUDIO.NOTIFICATION_VOLUME);

    createNotification('Saved notification volume!', 'success');
});

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
        fs.writeFileSync(settingsPath, ini.stringify(settings));
    });
});

document.body.querySelector('#notificationVolumeSlider').addEventListener('mouseup', () => {
    createNotification('Saved notification volume!', 'success');
});

if (settings.AUDIO.NOTIFICATION_VOLUME) {
    document.querySelector('#notificationVolumeSlider').value = settings.AUDIO.NOTIFICATION_VOLUME;
    document.querySelector('#notificationVolumeSlider').dispatchEvent(new Event('change'));
} else {
    document.querySelector('#notificationVolumeSlider').dispatchEvent(new Event('change', { value: 50 }));
}

document.body.querySelector('#ttsVolume').addEventListener('change', () => {
    let element = document.body.querySelector('#ttsVolume');
    settings.TTS.TTS_VOLUME = element.value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));

    const slider = document.querySelector('#ttsVolumeSlider');
    slider.value = settings.TTS.TTS_VOLUME;
    slider.style.setProperty('--tiempotemporal', settings.TTS.TTS_VOLUME);

    createNotification('Saved TTS volume!', 'success');
});

document.body.querySelector('#ttsVolumeSlider').addEventListener('change', () => {
    const e = document.querySelector('#ttsVolumeSlider');
    e.style.setProperty('--tiempotemporal', e.value);
    e.style.setProperty('--min', e.min === '' ? '0' : e.min);
    e.style.setProperty('--max', e.max === '' ? '100' : e.max);
    document.querySelector('#ttsVolume').value = e.value;

    e.addEventListener('input', () => {
        e.style.setProperty('--tiempotemporal', e.value);
        document.querySelector('#ttsVolume').value = e.value;
        settings.TTS.TTS_VOLUME = e.value;
        fs.writeFileSync(settingsPath, ini.stringify(settings));
    });
});

document.body.querySelector('#ttsVolumeSlider').addEventListener('mouseup', () => {
    createNotification('Saved TTS volume!', 'success');
});

if (settings.TTS.TTS_VOLUME) {
    document.querySelector('#ttsVolumeSlider').value = settings.TTS.TTS_VOLUME;
    document.querySelector('#ttsVolumeSlider').dispatchEvent(new Event('change'));
} else {
    document.querySelector('#ttsVolumeSlider').dispatchEvent(new Event('change', { value: 50 }));
}

document.body.querySelector('#ttsVolume').addEventListener('change', () => {
    let element = document.body.querySelector('#ttsVolume');
    settings.TTS.TTS_VOLUME = element.value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));

    const slider = document.querySelector('#ttsVolumeSlider');
    slider.value = settings.TTS.TTS_VOLUME;
    slider.style.setProperty('--tiempotemporal', settings.TTS.TTS_VOLUME);
});

document.body.querySelector('.language-selector').addEventListener('click', () => {
    var dropdown = document.body.querySelector('.language-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.body.querySelector('.language-dropdown').addEventListener('mouseleave', () => {
    hideDropdown();
});

let languageSelector = document.querySelectorAll('.language-item');
languageSelector.forEach((item) => {
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
    getGeneralSettings,
};
