/* global settings, resourcesPath, sound, twitch, getLanguageProperties, addSingleTooltip, showChatMessage, languageObject, addVoiceService, internalVoices, ttsRequestCount, main, path, pythonPath, settingsPath, ipcRenderer */

const spawn = require('child_process').spawn;
const kill = require('kill-process-by-name');
let python;

async function getInstalledVoices() {
  if (!settings.TTS.USE_TTS) {
    return;
  }
  addVoiceService('Internal');

  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/voices`, { method: 'GET' });
    if (response.ok) {
      const responseData = await response.json();
      console.log('Voices:', responseData);
      internalVoices = responseData;
    } else {
      console.error('Failed to send termination signal to Flask server.');
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
  }

  const primaryVoice = document.querySelector('#primaryVoice');
  const secondaryVoice = document.querySelector('#secondaryVoice');

  function setVoicesinSelect(voiceSelect) {
    const voices = Object.values(internalVoices.voices);
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.classList.add('option');

      option.value = voice;
      option.innerHTML = voice;

      voiceSelect.appendChild(option);
    });
  }
  setVoicesinSelect(primaryVoice);
  primaryVoice.value = settings.TTS.PRIMARY_VOICE;
  setVoicesinSelect(secondaryVoice);
  secondaryVoice.value = settings.TTS.SECONDARY_VOICE;
}

// TODO: refactor
function setTranslatedUserMessage(message) {
  const userMessage = document.getElementById(message.messageId);
  const messageBox = userMessage.getElementsByClassName('msg-box')[0];

  const languageElement = document.createElement('span');
  languageElement.classList = `fi fi-${message.language.selectedLanguage.ISO3166} fis flag-icon user-flag`;
  languageElement.setAttribute('tip', message.language.selectedLanguage.name);
  userMessage.appendChild(languageElement);
  addSingleTooltip(languageElement);

  const translationHeader = document.createElement('div');
  translationHeader.className = 'translation-header user';
  translationHeader.innerText = 'Translation';
  messageBox.appendChild(translationHeader);

  const languageElement2 = document.createElement('span');
  languageElement2.classList = `fi fi-${message.language.detectedLanguage.ISO3166} fis flag-icon user`;
  languageElement2.setAttribute('tip', message.language.detectedLanguage.name);
  addSingleTooltip(languageElement2);
  messageBox.appendChild(languageElement2);

  const translationMessage = document.createElement('div');
  translationMessage.className = 'translation-message user';
  translationMessage.innerText = message.translation;
  messageBox.appendChild(translationMessage);
}

function setTranslatedMessage(message) {
  // this determines if it is a message that is send by a user
  const languageBox = document.getElementById(message.messageId).getElementsByClassName('language-icon flag-icon')[0];
  if (!languageBox) {
    twitch.sendMessage(
      `[${message.language.detectedLanguage.name} ${message.language.detectedLanguage.ISO639} > ${message.language.selectedLanguage.name} ${message.language.selectedLanguage.ISO639}] @${message.username}: ${message.translation}`
    );
    return setTranslatedUserMessage(message);
  }

  if (message.language.selectedLanguage.ISO639 !== message.language.detectedLanguage.ISO639) {
    const messageBox = document.getElementById(message.messageId).getElementsByClassName('msg-box')[0];

    languageBox.classList = `fi fi-${message.language.detectedLanguage.ISO3166} fis language-icon flag-icon`;
    languageBox.setAttribute('tip', message.language.detectedLanguage.name);

    const translationHeader = document.createElement('div');
    translationHeader.className = 'translation-header';
    translationHeader.innerText = 'Translation';
    messageBox.appendChild(translationHeader);

    const translationIcon = document.createElement('div');
    translationIcon.className = 'translation-icon';
    const languageElement = document.createElement('span');
    languageElement.classList = `fi fi-${message.language.selectedLanguage.ISO3166} fis flag-icon`;
    languageElement.setAttribute('tip', message.language.selectedLanguage.name);
    addSingleTooltip(languageElement);
    translationIcon.appendChild(languageElement);
    messageBox.appendChild(translationIcon);

    const translationMessage = document.createElement('div');
    translationMessage.className = 'translation-message';
    translationMessage.innerText = message.translation;
    messageBox.appendChild(translationMessage);
    showChatMessage();
  }

  if (settings.LANGUAGE.OUTPUT_TO_TTS) {
    sound.playVoice({
      originalMessage: message.originalMessage,
      filteredMessage: message.translation,
      logoUrl: message.logoUrl,
      username: message.username,
      formattedMessage: message.formattedMessage,
      language: message.language
    });
  }
  return message.language.detectedLanguage;
}

async function getTranslatedMessage(message) {
  const requestOptions = {
    method: 'POST', // HTTP method
    headers: {
      'Content-Type': 'application/json; charset="utf-8"' // Specify the content type
    },
    body: JSON.stringify({
      message: message.message,
      language: message.language.detectedLanguage.IETF
    }) // Convert the data to JSON and include it in the request body
  };

  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/translate`, requestOptions);
    const responseData = await response.json();
    if (response.ok) {
      console.log('Translated message:', responseData);

      if (settings.LANGUAGE.BROADCAST_TRANSLATION) {
        twitch.sendMessage(
          `[${message.language.detectedLanguage.name} ${message.language.detectedLanguage.ISO639} > ${message.language.selectedLanguage.name} ${message.language.selectedLanguage.ISO639}] @${message.username}: ${responseData.translation}`
        );
      }
      setTranslatedMessage({
        originalMessage: message.message,
        translation: responseData.translation,
        messageId: message.messageId,
        language: message.language,
        formattedMessage: message.formattedMessage,
        username: message.username,
        logoUrl: message.logoUrl
      });
      return message.language.detectedLanguage;
    } else {
      console.error(responseData);
      if (responseData.code === 500) {
        if (message.remainingDetectedLanguages.length > 0) {
          message.language.detectedLanguage = getLanguageProperties(message.remainingDetectedLanguages[0]);
          message.remainingDetectedLanguages.shift();
          return getTranslatedMessage(message);
        } else {
          message.message = 'Error, Could not translate message';
          message.language.detectedLanguage = getLanguageProperties('en-GB');
          return getTranslatedMessage(message);
        }
      }
      if (responseData.code === 429) {
        message.language.detectedLanguage = getLanguageProperties('en-GB');
        setTranslatedMessage({
          originalMessage: message.message,
          translation: 'Rate limit exceeded, please change translation service.',
          messageId: message.messageId,
          language: message.language,
          formattedMessage: message.formattedMessage,
          username: message.username,
          logoUrl: message.logoUrl
        });
      }
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
    message.language.detectedLanguage = getLanguageProperties('en-GB');
    setTranslatedMessage({
      originalMessage: message.message,
      translation: 'Error, could not translate message.',
      messageId: message.messageId,
      language: message.language,
      formattedMessage: message.formattedMessage,
      username: message.username,
      logoUrl: message.logoUrl
    });
  }
}

async function filterLanguage(message) {
  const selectedPrimaryLanguage = getLanguageProperties(settings.LANGUAGE.TRANSLATE_TO);
  const selectedPrimaryLanguageIndex =
    message.languages.indexOf(selectedPrimaryLanguage.ISO639) === -1 ? 99 : message.languages.indexOf(selectedPrimaryLanguage.ISO639);

  const selectedSecondaryLanguage = getLanguageProperties(settings.TTS.SECONDARY_TTS_LANGUAGE);
  const selectedSecondaryLanguageIndex =
    message.languages.indexOf(selectedSecondaryLanguage.ISO639) === -1 ? 99 : message.languages.indexOf(selectedSecondaryLanguage.ISO639);

  let detectedLanguage = '';
  const remainingDetectedLanguages = [];
  const detectedLanguages = message.languages.slice();

  for (const [index, language] of detectedLanguages.entries()) {
    detectedLanguage = getLanguageProperties(language);

    if (detectedLanguage !== 'error') {
      detectedLanguages.splice(index, 1);
      break;
    }
  }

  for (const [index, language] of detectedLanguages.entries()) {
    const remainderLanguage = getLanguageProperties(language);
    if (remainderLanguage !== 'error') {
      remainingDetectedLanguages.push(remainderLanguage.IETF);
    }
  }

  const language = selectedPrimaryLanguageIndex < selectedSecondaryLanguageIndex ? selectedPrimaryLanguage : detectedLanguage;
  if (settings.LANGUAGE.TRANSLATE_TO !== 'none' && selectedPrimaryLanguage.ISO639 !== detectedLanguage.ISO639) {
    getTranslatedMessage({
      message: message.message,
      messageId: message.messageId,
      remainingDetectedLanguages,
      language: {
        selectedLanguage: selectedPrimaryLanguage,
        detectedLanguage: detectedLanguage
      },
      username: message.username,
      formattedMessage: message.formattedMessage,
      logoUrl: message.logoUrl
    });
  } else {
    setTranslatedMessage({
      originalMessage: message.message,
      translation: message.message,
      messageId: message.messageId,
      language: {
        selectedLanguage: selectedPrimaryLanguage,
        detectedLanguage: selectedPrimaryLanguage
      },
      formattedMessage: message.formattedMessage,
      username: message.username,
      logoUrl: message.logoUrl
    });
  }

  return language;
}

async function getDetectedLanguage(message) {
  if (!settings.LANGUAGE.USE_DETECTION) {
    return;
  }

  const requestOptions = {
    method: 'POST', // HTTP method
    headers: {
      'Content-Type': 'application/json' // Specify the content type
    },
    body: JSON.stringify({ message: message.message }) // Convert the data to JSON and include it in the request body
  };

  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/detect`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();

      console.log('Detected Languages:', responseData);
      return await filterLanguage({
        languages: responseData.languages,
        message: message.message,
        messageId: message.messageId,
        username: message.username,
        formattedMessage: message.formattedMessage
      });
    } else {
      console.error('Failed to send termination signal to Flask server.');
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
  }
}

async function getBackendServerStatus() {
  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/status`, { method: 'GET' });
    if (response.ok) {
      const responseData = await response.json();
      console.log('Status:', responseData);
    } else {
      console.error('Failed to send termination signal to Flask server.');
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
  }
}

function startSTT() {
  const eventSource = new EventSource('http://127.0.0.1:9000/stream');

  eventSource.addEventListener('message', event => {
    const result = event.data;
    console.log(result); // Log the received data
  });

  eventSource.addEventListener('error', event => {
    console.error('EventSource failed:', event);

    eventSource.close();
  });

  window.addEventListener('beforeunload', () => {
    eventSource.close();
  });
}

async function getInternalTTSAudio(requestData) {
  ttsRequestCount++;
  requestData.count = ttsRequestCount;
  const requestOptions = {
    method: 'POST', // HTTP method
    headers: {
      'Content-Type': 'application/json' // Specify the content type
    },
    body: JSON.stringify(requestData) // Convert the data to JSON and include it in the request body
  };

  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/audio`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();
      console.log('Audio:', responseData);
      return ttsRequestCount;
    } else {
      console.error('Failed to send termination signal to Flask server.');
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
  }
}

const createBackendServer = () =>
  new Promise(resolve => {
    if (main.isPackaged) {
      python = spawn(path.join(pythonPath, './loquendoBot_backend.exe'), [settingsPath, 'prod']);
    } else {
      python = spawn('python', ['-u', path.join(resourcesPath, '../backend/loquendoBot_backend.py'), settingsPath, 'dev']);
    }
    // Capture the stdout of the Python process
    python.stdout.on('data', data => {
      console.info(`${data}`);
    });

    // Capture the stderr of the Python process
    python.stderr.on('data', data => {
      // console.error(`${data}`);
      if (data.toString().startsWith('INFO:waitress:Serving on')) {
        resolve('finished');
      } else {
        console.error(`${data}`);
      }
    });

    // Listen for the Python process to exit
    python.on('close', code => {
      console.log(`Python process exited with code ${code}`);
    });

    if (typeof python.pid !== 'number') {
      console.log('failed');
    } else {
      // console.log(`Spawned subprocess correctly!, PID = ${python.pid}`);
    }
  });

async function initiateBackend() {
  try {
    createBackendServer().then(() => {
      getBackendServerStatus();
      getInstalledVoices();
      if (settings.STT.USE_STT && !settings.STT.LANGUAGE === '') {
        startSTT();
      }
    });
  } catch (error) {
    console.error('Error during backend initialization:', error);
  }
}

initiateBackend();

// TODO: convert to restartServer function
ipcRenderer.on('quit-event', async () => {
  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/terminate`, { method: 'GET' });
    if (response.ok) {
      const responseData = await response.json();
      console.log('Response:', responseData);
      kill('loquendoBot_backend');
    } else {
      console.error('Failed to send termination signal to Flask server.');
      kill('loquendoBot_backend');
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
    kill('loquendoBot_backend');
  }
});

module.exports = { getInternalTTSAudio, getDetectedLanguage, getTranslatedMessage };
