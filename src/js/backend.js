/* global settings, sound, twitch, getLanguageProperties, addSingleTooltip, showChatMessage, languageObject, addVoiceService, internalVoices, ttsRequestCount, main, path, pythonPath, settingsPath, ipcRenderer */

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

function setTranslatedMessage(message) {
  const messageBox = document.getElementById(message.messageId).getElementsByClassName('msg-box')[0];

  const translationHeader = document.createElement('div');
  translationHeader.className = 'translation-header';
  translationHeader.innerText = 'Translation';
  messageBox.appendChild(translationHeader);

  const translationIcon = document.createElement('div');
  translationIcon.className = 'translation-icon';
  const languageElement = document.createElement('span');
  const language = getLanguageProperties(settings.LANGUAGE.TRANSLATE_TO);
  languageElement.classList = `fi fi-${language.ISO3166} fis`;
  languageElement.setAttribute('tip', language.name);
  addSingleTooltip(languageElement);
  translationIcon.appendChild(languageElement);
  messageBox.appendChild(translationIcon);

  const translationMessage = document.createElement('div');
  translationMessage.className = 'translation-message';
  translationMessage.innerText = message.translation;
  messageBox.appendChild(translationMessage);
  showChatMessage();
  if (settings.LANGUAGE.OUTPUT_TO_TTS) {
    sound.playVoice({
      filteredMessage: message.translation,
      logoUrl: message.logoUrl,
      username: message.username,
      formattedMessage: message.formattedMessage,
      language
    });
  }
}

async function getTranslatedMessage(message) {
  const requestOptions = {
    method: 'POST', // HTTP method
    headers: {
      'Content-Type': 'application/json; charset="utf-8"' // Specify the content type
    },
    body: JSON.stringify({
      message: message.message,
      language: message.language
    }) // Convert the data to JSON and include it in the request body
  };

  try {
    const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/translate`, requestOptions);
    if (response.ok) {
      const responseData = await response.json();

      console.log('Translated message:', responseData);
      setTranslatedMessage({
        translation: responseData.translation,
        messageId: message.messageId,
        ISO3166: message.ISO3166,
        formattedMessage: message.formattedMessage,
        username: message.username,
        logoUrl: message.logoUrl
      });
      if (settings.LANGUAGE.BROADCAST_TRANSLATION) {
        twitch.sendMessage(`[${message.language} > ${settings.LANGUAGE.TRANSLATE_TO}] @${message.username}: ${responseData.translation}`);
      }
    } else {
      console.error('Failed to send termination signal to Flask server.');
      message.message = 'Error,could not translate message';
      message.languaga = 'en-GB';
      getTranslatedMessage(message);
    }
  } catch (error) {
    console.error('Error sending termination signal:', error);
  }
}

function filterLanguage(message) {
  const language = getLanguageProperties(message.language);

  if (settings.LANGUAGE.TRANSLATE_TO !== 'none') {
    getTranslatedMessage({
      message: message.message,
      messageId: message.messageId,
      language: language.IETF,
      ISO3166: language.ISO3166,
      username: message.username,
      formattedMessage: message.formattedMessage
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
      return filterLanguage({
        language: responseData.languages[0],
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
      python = spawn('python', ['-u', path.join(pythonPath, './loquendoBot_backend.py'), settingsPath, 'dev']);
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
      if (settings.STT.USE_STT) {
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

module.exports = { getInternalTTSAudio, getDetectedLanguage };
