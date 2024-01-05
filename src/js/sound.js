/* global ttsAudioFile, main, path, getLanguageProperties, resourcesPath, settings, fs, notificationSound, backend, socket, requestData */

const voiceSoundArray = [];
let status = 0;
const counter = 0;

const playTTS = data =>
  new Promise(resolve => {
    ttsAudioFile = path.join(
      resourcesPath,
      main.isPackaged ? `./sounds/${data.service}_${data.count}.mp3` : `../sounds/${data.service}_${data.count}.mp3`
    );
    const tts = new Audio(ttsAudioFile);
    tts.setSinkId(settings.AUDIO.TTS_AUDIO_DEVICE);

    tts.addEventListener('ended', () => {
      // console.log('ended');
      fs.unlink(ttsAudioFile, err => {
        if (err) {
          console.error(err);
          resolve('finished');
          return;
        }
        resolve('finished');
      });
    });

    tts
      .setSinkId(settings.AUDIO.TTS_AUDIO_DEVICE)
      .then(() => {
        // console.log('playing');
        tts.volume = settings.AUDIO.TTS_VOLUME / 100;
        tts.play().catch(error => {
          if (error) {
            console.error(error);
          }
          resolve('finished');
        });
      })
      .catch(error => {
        console.error('Failed to set audio output device:', error);
        resolve('finished');
      });
  });

async function shiftVoice() {
  status = 1;
  while (voiceSoundArray.length > 0) {
    await playTTS(voiceSoundArray.shift());
  }
  status = 0;
}

function add(data) {
  voiceSoundArray.push(data);
  if (status === 0) {
    shiftVoice();
  }
}

function playNotificationSound() {
  if (settings.AUDIO.USE_NOTIFICATION_SOUNDS) {
    const notfication = new Audio(
      path.join(
        resourcesPath,
        main.isPackaged
          ? `./sounds/notifications/${notificationSound.options[settings.AUDIO.NOTIFICATION_SOUND].text}`
          : `../sounds/notifications/${notificationSound.options[settings.AUDIO.NOTIFICATION_SOUND].text}`
      )
    );

    notfication
      .setSinkId(settings.AUDIO.SELECTED_NOTIFICATION_AUDIO_DEVICE)
      .then(() => {
        // console.log('playing');
        notfication.volume = settings.AUDIO.NOTIFICATION_VOLUME / 100;
        notfication.play().catch(error => {
          if (error) {
            console.error(error);
          }
        });
      })
      .catch(error => {
        console.error('Failed to set audio output device:', error);
      });
  }
}

// Play sound function
function playAudio(data) {
  if (data.service !== '') {
    add(data);
  }
}

async function playVoice(message) {
  if (!settings.TTS.PRIMARY_VOICE) {
    return;
  }
  const textObject = { filtered: message.filteredMessage, formatted: message.formattedMessage };
  let voice = settings.TTS.PRIMARY_VOICE;
  textObject.filtered = `${message.username}: ${message.filteredMessage}`;

  if (settings.LANGUAGE.USE_DETECTION && settings.TTS.SECONDARY_VOICE) {
    const secondaryTTSLanguage = getLanguageProperties(settings.TTS.SECONDARY_TTS_LANGUAGE);
    if (message.language.detectedLanguage === null || message.language.detectedLanguage.ISO639 === secondaryTTSLanguage.ISO639) {
      voice = settings.TTS.SECONDARY_VOICE;
      textObject.filtered = message.originalMessage ? message.originalMessage : message.filteredMessage;
    }
  }

  const service = document.getElementById('primaryTTSService').value;

  switch (service) {
    case 'Internal': {
      const requestData = {
        message: textObject.filtered,
        voice: voice
      };

      const count = await backend.getInternalTTSAudio(requestData);
      playAudio({ service, message: textObject, count });
      break;
    }
    case 'Amazon':
      // playAudio({ service: 'Amazon', message: textObject, count });
      break;
    case 'Google':
      // playAudio({ service: 'Google', message: textObject, count });
      break;
  }

  if (settings.MODULES.USE_CHATBUBBLE) {
    socket.emit('xxx', message);
  }
}

module.exports = { playAudio, playVoice, playNotificationSound };
