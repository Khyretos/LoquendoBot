/* global settings,main sttModels, setZoomLevel, webFrame, theme, fs, settingsPath, ini, startVoiceRecognition,notificationSoundAudioDevices, ttsAudioDevices, notificationSound, path, resourcesPath, ipcRenderer, auth, shell, sound, twitch, server, backend */

function getGeneralSettings() {
  // General
  document.body.querySelector('#PORT').value = settings.GENERAL.PORT;
  document.body.querySelector('#ZOOMLEVEL').value = settings.GENERAL.ZOOMLEVEL * 100;
  webFrame.setZoomFactor(parseFloat(settings.GENERAL.ZOOMLEVEL));
  // Theme
  document.querySelector('#USE_CUSTOM_THEME').value = settings.THEME.USE_CUSTOM_THEME;
  document.body.querySelector('#USE_CUSTOM_THEME').checked = settings.THEME.USE_CUSTOM_THEME === true ? 1 : 0;
  theme.setTheme();

  // STT
  document.body.querySelector('#USE_STT').checked = settings.STT.USE_STT;

  // Language detection
  document.body.querySelector('#USE_DETECTION').checked = settings.LANGUAGE.USE_DETECTION;
  document.body.querySelector('#OUTPUT_TO_TTS').checked = settings.LANGUAGE.OUTPUT_TO_TTS;
  document.body.querySelector('#BROADCAST_TRANSLATION').checked = settings.LANGUAGE.BROADCAST_TRANSLATION;

  // TTS
  document.body.querySelector('#USE_TTS').checked = settings.TTS.USE_TTS;

  // Notification sounds
  document.body.querySelector('#USE_NOTIFICATION_SOUNDS').checked = settings.AUDIO.USE_NOTIFICATION_SOUNDS;

  // Twitch
  document.body.querySelector('#USE_TWITCH').checked = settings.TWITCH.USE_TWITCH;
  document.body.querySelector('#TWITCH_CHANNEL_NAME').value = settings.TWITCH.CHANNEL_NAME;
  document.body.querySelector('#TWITCH_OAUTH_TOKEN').value = settings.TWITCH.OAUTH_TOKEN;

  // Modules
  document.body.querySelector('#USE_MODULES').checked = settings.MODULES.USE_MODULES;
  document.body.querySelector('#USE_VTUBER').checked = settings.MODULES.USE_VTUBER;
  document.body.querySelector('#VTUBER_URL').value = `http://localhost:${settings.GENERAL.PORT}/vtuber/`;
  showMenuButton('#btnBrowsersourceVtuber', settings.MODULES.USE_VTUBER);
  document.body.querySelector('#USE_CHATBUBBLE').checked = settings.MODULES.USE_CHATBUBBLE;
  document.body.querySelector('#CHATBUBBLE_URL').value = `http://localhost:${settings.GENERAL.PORT}/chat/`;
  showMenuButton('#btnBrowsersourceChat', settings.GENERAL.USE_CHATBUBBLE);

  // Amazon
  document.body.querySelector('#USE_AMAZON').checked = settings.AMAZON.USE_AMAZON;
  document.body.querySelector('#AMAZON_ACCESS_KEY').value = settings.AMAZON.ACCESS_KEY;
  document.body.querySelector('#AMAZON_ACCESS_SECRET').value = settings.AMAZON.ACCESS_SECRET;

  // Google
  document.body.querySelector('#USE_GOOGLE').checked = settings.GOOGLE.USE_GOOGLE;
  document.body.querySelector('#GOOGLE_API_KEY').value = settings.GOOGLE.API_KEY;
}

document.body.querySelector('#primaryAmazonVoice').addEventListener('change', () => {
  const select = document.querySelector('#primaryAmazonVoice');
  settings.AMAZON.PRIMARY_VOICE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved Amazon primary voice!', 'success');
});

document.body.querySelector('#secondaryAmazonVoice').addEventListener('change', () => {
  const select = document.querySelector('#secondaryAmazonVoice');
  settings.AMAZON.SECONDARY_VOICE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved Amazon secondary voice!', 'success');
});

document.body.querySelector('#primaryGoogleVoice').addEventListener('change', () => {
  const select = document.querySelector('#primaryGoogleVoice');
  settings.GOOGLE.PRIMARY_VOICE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved Google primary voice!', 'success');
});

document.body.querySelector('#secondaryGoogleVoice').addEventListener('change', () => {
  const select = document.querySelector('#secondaryGoogleVoice');
  settings.GOOGLE.SECONDARY_VOICE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved Google secondary voice!', 'success');
});

document.body.querySelector('#primaryVoice').addEventListener('change', () => {
  const select = document.querySelector('#primaryVoice');
  settings.TTS.PRIMARY_VOICE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved primary voice!', 'success');
});

document.body.querySelector('#microphone').addEventListener('change', () => {
  const select = document.querySelector('#microphone');
  settings.STT.MICROPHONE = select.value;
  settings.STT.MICROPHONE_ID = select.options[select.selectedIndex].text;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved microphone!', 'success');
  startVoiceRecognition();
});

document.body.querySelector('#sttModel').addEventListener('change', () => {
  const select = document.querySelector('#sttModel');
  settings.STT.LANGUAGE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved voice detection language!', 'success');
});

document.body.querySelector('#defaultLanguage').addEventListener('change', () => {
  const select = document.querySelector('#defaultLanguage');
  settings.TTS.PRIMARY_TTS_LANGUAGE_INDEX = select.selectedIndex;
  settings.TTS.PRIMARY_TTS_LANGUAGE = select.options[select.selectedIndex].value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved default language!', 'success');
});

document.body.querySelector('#secondaryVoice').addEventListener('change', () => {
  const select = document.querySelector('#secondaryVoice');
  settings.TTS.SECONDARY_VOICE = select.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved secondary voice!', 'success');
});

document.body.querySelector('#secondaryLanguage').addEventListener('change', () => {
  const select = document.querySelector('#secondaryLanguage');
  settings.TTS.SECONDARY_TTS_LANGUAGE_INDEX = select.selectedIndex;
  settings.TTS.SECONDARY_TTS_LANGUAGE = select.options[select.selectedIndex].value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved secondary language!', 'success');
});

document.body.querySelector('#language').addEventListener('change', () => {
  const select = document.querySelector('#language');
  settings.GENERAL.LANGUAGE_INDEX = select.selectedIndex;
  settings.GENERAL.LANGUAGE = select.options[select.selectedIndex].value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved language!', 'success');
});

function setTranslateToOptions() {
  const options = document.querySelectorAll('.TRANSLATE_TO');
  const index = parseInt(settings.LANGUAGE.TRANSLATE_TO_INDEX);

  if (index === 0) {
    settings.LANGUAGE.BROADCAST_TRANSLATION = false;
    settings.LANGUAGE.OUTPUT_TO_TTS = false;
    options.forEach(item => {
      item.style.visibility = 'hidden';
      item.style.height = '0px';
      item.checked = false;
    });
  } else {
    options.forEach(item => {
      item.style.visibility = '';
      item.style.height = '';
    });
  }
}

setTranslateToOptions();

document.body.querySelector('#TRANSLATE_TO').addEventListener('change', () => {
  const select = document.querySelector('#TRANSLATE_TO');
  settings.LANGUAGE.TRANSLATE_TO_INDEX = select.selectedIndex;
  settings.LANGUAGE.TRANSLATE_TO = select.options[select.selectedIndex].value;
  setTranslateToOptions();

  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved primary voice!', 'success');
});

document.body.querySelector('#ttsAudioDevice').addEventListener('change', () => {
  settings.AUDIO.TTS_AUDIO_DEVICE = ttsAudioDevices.value;
  settings.AUDIO.SELECTED_TTS_AUDIO_DEVICE = ttsAudioDevices.selectedIndex;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved audio device!', 'success');
});

document.body.querySelector('#notificationSoundAudioDevice').addEventListener('change', () => {
  settings.AUDIO.SELECTED_NOTIFICATION_AUDIO_DEVICE = notificationSoundAudioDevices.value;
  settings.AUDIO.NOTIFICATION_AUDIO_DEVICE = notificationSoundAudioDevices.selectedIndex;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved audio device!', 'success');
});

document.body.querySelector('#TWITCH_CHANNEL_NAME').addEventListener('change', () => {
  settings.TWITCH.CHANNEL_NAME = document.body.querySelector('#TWITCH_CHANNEL_NAME').value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved Channel name, please restart the application to reset twitch service', 'warning');
  twitch.getTwitchChannelId();
});

document.body.querySelector('#TWITCH_OAUTH_TOKEN').addEventListener('change', () => {
  settings.TWITCH.OAUTH_TOKEN = document.body.querySelector('#TWITCH_OAUTH_TOKEN').value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification('Saved OAuth token, please restart the application to reset twitch service', 'warning');
});

setInputFilter(
  document.body.querySelector('#PORT'),
  function (value) {
    return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp.
  },
  "Only digits and '.' are allowed"
);

document.body.querySelector('#PORT').addEventListener('change', () => {
  settings.GENERAL.PORT = document.body.querySelector('#PORT').value;
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

function showMenuButton(menuButton, toggle) {
  const option = document.body.querySelector(menuButton);
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

  if (settings.AUDIO.USE_NOTIFICATION_SOUNDS) {
    const notfication = new Audio(
      path.join(resourcesPath, main.isPackaged ? `./sounds/notifications/${alertSound}` : `../sounds/notifications/${alertSound}`)
    );
    notfication.volume = settings.AUDIO.NOTIFICATION_VOLUME / 100;
    notfication.play();
  }

  setTimeout(() => notification.remove(), 3000);
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

document.body.querySelector('#OPEN_SETTINGS_FILE').addEventListener('click', () => {
  shell.openExternal(settingsPath);
});

document.body.querySelector('#Info_VOICE_MODELS_FOLDER').addEventListener('click', () => {
  shell.openExternal(sttModels);
});

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
document.body.querySelector('#Info_USERNAME').addEventListener('click', async () => {
  const element = document.body.querySelector('#TWITCH_OAUTH_TOKEN');
  element.value = await auth.getTwitchOauthToken();
  twitch.checkIfTokenIsValid();
  createNotification('Saved OAuth token!', 'success');
});

const hideInputToggleButton = document.body.querySelectorAll('.password-toggle-btn .password-toggle-icon .fa-eye-slash');
hideInputToggleButton.forEach(item => {
  item.addEventListener('click', () => {
    if (item.classList.contains('fa-eye')) {
      item.classList.remove('fa-eye');
      item.classList.add('fa-eye-slash');
    } else {
      item.classList.remove('fa-eye-slash');
      item.classList.add('fa-eye');
    }
  });
});

function hideOrShowViewerPanel() {
  const menu = document.body.querySelector('.sidepanel-right');
  const leftCircle = document.body.querySelector('.circle-right');

  if (!settings.GENERAL.VIEWERS_PANEL) {
    menu.classList.add('collapse-menu-right');
    leftCircle.classList.add('collapse-circle-right');
  } else {
    menu.classList.remove('collapse-menu-right');
    leftCircle.classList.remove('collapse-circle-right');
  }
  fs.writeFileSync(settingsPath, ini.stringify(settings));
}

hideOrShowViewerPanel();

document.body.querySelector('#VIEWERS_PANEL').addEventListener('click', () => {
  if (settings.GENERAL.VIEWERS_PANEL) {
    settings.GENERAL.VIEWERS_PANEL = false;
  } else {
    settings.GENERAL.VIEWERS_PANEL = true;
  }
  hideOrShowViewerPanel();
});

document.body.querySelector('#Info_VTUBER').addEventListener('click', () => {
  shell.openExternal(`http://localhost:${settings.GENERAL.PORT}/vtuber/`);
});

document.body.querySelector('#Info_CHATBUBBLE').addEventListener('click', () => {
  shell.openExternal(`http://localhost:${settings.GENERAL.PORT}/chat/`);
});

document.body.querySelector('#max-button').addEventListener('click', () => {
  ipcRenderer.send('maximize-window');
});

document.body.querySelector('#close-button').addEventListener('click', () => {
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
  const toggle = settings.MODULES.USE_MODULES;
  const inputs = document.getElementsByClassName('inputServer');
  toggleRadio(toggle, inputs);
}

toggleServer();

document.body.querySelector('#USE_MODULES').addEventListener('click', () => {
  const toggle = document.getElementById('USE_MODULES').checked;
  settings.MODULES.USE_MODULES = toggle;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  const inputs = document.getElementsByClassName('inputServer');
  toggleRadio(toggle, inputs);
  createNotification(
    `${toggle ? 'Enabled' : 'Disabled'} server settings!, the service will stop working after restarting the application
        ${toggle ? '' : ', the service will stop working after restarting the application'}`,
    'success'
  );
});

document.body.querySelector('#USE_VTUBER').addEventListener('change', () => {
  const toggle = document.getElementById('USE_VTUBER').checked;
  settings.MODULES.USE_VTUBER = toggle;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  showMenuButton('#btnBrowsersourceVtuber', toggle);
  createNotification(
    `${toggle ? 'Enabled' : 'Disabled'} Vtuber setting!
        ${toggle ? '' : ', the service will stop working after restarting the application'}`,
    'success'
  );
  server.startVtuberModule();
});

document.body.querySelector('#USE_CHATBUBBLE').addEventListener('change', () => {
  const toggle = document.getElementById('USE_CHATBUBBLE').checked;
  settings.MODULES.USE_CHATBUBBLE = toggle;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  showMenuButton('#btnBrowsersourceChat', toggle);
  createNotification(`${toggle ? 'Enabled' : 'Disabled'} chatbubble setting!`, 'success');
  server.startChatBubbleModule();
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

function toggleSTT() {
  const toggle = settings.STT.USE_STT;
  const inputs = document.getElementsByClassName('inputSTT');
  toggleRadio(toggle, inputs);
}

toggleSTT();

document.body.querySelector('#USE_STT').addEventListener('change', () => {
  const toggle = document.getElementById('USE_STT').checked;
  settings.STT.USE_STT = toggle;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  const inputs = document.getElementsByClassName('inputSTT');
  toggleRadio(toggle, inputs);
  createNotification(`${toggle ? 'Enabled' : 'Disabled'} speech to text!`, 'success');
});

document.body.querySelector('#OUTPUT_TO_TTS').addEventListener('change', () => {
  let toggle = document.getElementById('OUTPUT_TO_TTS').checked;
  if (!settings.TTS.USE_TTS) {
    toggle = false;
    createNotification('Enable TTS first', 'error');
    return;
  }

  settings.LANGUAGE.OUTPUT_TO_TTS = toggle;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification(`${toggle ? 'Enabled' : 'Disabled'} Outputting translations to TTS!`, 'success');
});

document.body.querySelector('#BROADCAST_TRANSLATION').addEventListener('change', () => {
  const toggle = document.getElementById('BROADCAST_TRANSLATION').checked;
  settings.LANGUAGE.BROADCAST_TRANSLATION = toggle;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  createNotification(`${toggle ? 'Enabled' : 'Disabled'} Language detection!`, 'success');
});

function toggleLanguageDetection() {
  const toggle = settings.LANGUAGE.USE_DETECTION;
  const inputs = document.getElementsByClassName('languageDetectionInput');
  toggleRadio(toggle, inputs);
}

toggleLanguageDetection();

document.body.querySelector('#USE_DETECTION').addEventListener('change', () => {
  const toggle = document.getElementById('USE_DETECTION').checked;
  settings.LANGUAGE.USE_DETECTION = toggle;

  if (!toggle) {
    settings.LANGUAGE.BROADCAST_TRANSLATION = false;
    document.body.querySelector('#BROADCAST_TRANSLATION').checked = false;
    settings.LANGUAGE.OUTPUT_TO_TTS = false;
    document.body.querySelector('#OUTPUT_TO_TTS').checked = false;
  }

  fs.writeFileSync(settingsPath, ini.stringify(settings));
  const inputs = document.getElementsByClassName('languageDetectionInput');
  toggleRadio(toggle, inputs);
  createNotification(`${toggle ? 'Enabled' : 'Disabled'} Language detection!`, 'success');
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
  const element = document.body.querySelector('#notificationVolume');
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
  const element = document.body.querySelector('#ttsVolume');
  settings.AUDIO.TTS_VOLUME = element.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));

  const slider = document.querySelector('#ttsVolumeSlider');
  slider.value = settings.AUDIO.TTS_VOLUME;
  slider.style.setProperty('--tiempotemporal', settings.AUDIO.TTS_VOLUME);

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
    settings.AUDIO.TTS_VOLUME = e.value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
  });
});

document.body.querySelector('#ttsVolumeSlider').addEventListener('mouseup', () => {
  createNotification('Saved TTS volume!', 'success');
});

if (settings.AUDIO.TTS_VOLUME) {
  document.querySelector('#ttsVolumeSlider').value = settings.AUDIO.TTS_VOLUME;
  document.querySelector('#ttsVolumeSlider').dispatchEvent(new Event('change'));
} else {
  document.querySelector('#ttsVolumeSlider').dispatchEvent(new Event('change', { value: 50 }));
}

document.body.querySelector('#ttsVolume').addEventListener('change', () => {
  const element = document.body.querySelector('#ttsVolume');
  settings.AUDIO.TTS_VOLUME = element.value;
  fs.writeFileSync(settingsPath, ini.stringify(settings));

  const slider = document.querySelector('#ttsVolumeSlider');
  slider.value = settings.AUDIO.TTS_VOLUME;
  slider.style.setProperty('--tiempotemporal', settings.AUDIO.TTS_VOLUME);
});

document.body.querySelector('#TestDefaultTTSButton').addEventListener('click', async () => {
  if (!settings.TTS.PRIMARY_VOICE) {
    return;
  }
  const text = document.getElementById('testPrimaryTTS').value;
  const requestData = {
    message: `user: ${text}`,
    voice: settings.TTS.PRIMARY_VOICE
  };
  const count = await backend.getInternalTTSAudio(requestData);
  const textObject = { filtered: text, formatted: text };
  sound.playAudio({ service: 'Internal', message: textObject, count });
});

document.body.querySelector('#TestSecondaryTTSButton').addEventListener('click', async () => {
  if (!settings.TTS.SECONDARY_VOICE) {
    return;
  }
  const text = document.getElementById('testSecondaryTTS').value;
  const requestData = {
    message: `user: ${text}`,
    voice: settings.TTS.SECONDARY_VOICE
  };

  const count = await backend.getInternalTTSAudio(requestData);
  const textObject = { filtered: text, formatted: text };

  sound.playAudio({ service: 'Internal', message: textObject, count });
});

// Restricts input for the given textbox to the given inputFilter function.
function setInputFilter(textbox, inputFilter, errMsg) {
  ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop', 'focusout'].forEach(function (event) {
    textbox.addEventListener(event, function (e) {
      if (inputFilter(this.value)) {
        // Accepted value.
        if (['keydown', 'mousedown', 'focusout'].indexOf(e.type) >= 0) {
          this.classList.remove('input-error');
          this.setCustomValidity('');
        }

        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (Object.prototype.hasOwnProperty.call(this, 'oldValue')) {
        // Rejected value: restore the previous one.
        this.classList.add('input-error');
        this.setCustomValidity(errMsg);
        this.reportValidity();
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        // Rejected value: nothing to restore.
        this.value = '';
      }
    });
  });
}

webFrame.setVisualZoomLevelLimits(1, 5);

document.body.addEventListener('wheel', e => {
  if (e.ctrlKey) {
    const currentZoom = webFrame.getZoomFactor();
    const zoomIn = Boolean(e.deltaY < 0);
    setZoomLevel(currentZoom, zoomIn);
  }
});

setInputFilter(
  document.body.querySelector('#ZOOMLEVEL'),
  function (value) {
    return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp.
  },
  "Only digits and '.' are allowed"
);

document.body.querySelector('#ZOOMLEVEL').addEventListener('change', () => {
  const newZoom = parseInt(document.body.querySelector('#ZOOMLEVEL').value) / 100;
  settings.GENERAL.ZOOMLEVEL = newZoom;
  fs.writeFileSync(settingsPath, ini.stringify(settings));
  setZoomLevel(newZoom, null);
  createNotification('Saved zoom new level', 'warning');
});

document.body.querySelector('emoji-picker').addEventListener('emoji-click', e => {
  console.log(e.detail);
  const div = document.getElementById('textInput');
  if (e.detail.unicode === undefined) {
    div.value += e.detail.name + ' ';
  } else {
    div.value += e.detail.unicode + ' ';
  }

  div.focus();
});

module.exports = {
  getGeneralSettings,
  createNotification
};
