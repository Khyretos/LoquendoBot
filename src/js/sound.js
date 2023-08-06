let trueMessage = '';
let currentLogoUrl = '';
let currentUsername = '';
let voiceSoundArray = [];
let status = 0;

const playTTS = (ttsData) => new Promise((resolve) => {
    const tts = new Audio(ttsData.path);

    tts.addEventListener('ended', () => {
        fs.unlink(ttsData.path, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            resolve('finished');
        });
    });

    tts.setSinkId(config.settings.AUDIO.TTS_AUDIO_DEVICE).then(() => {
        tts.play();
        socket.emit('xxx', currentLogoUrl, currentUsername, ttsData.message);
    }).catch((error) => {
        console.error('Failed to set audio output device:', error);
    });
});

async function shiftVoice() {
    status = 1;
    while (voiceSoundArray.length > 0) {
        await playTTS(voiceSoundArray.shift());
    }
    status = 0;
}

function add(ttsData) {
    voiceSoundArray.push(ttsData);
    if (status === 0) {
        shiftVoice();
    }
}

// Play sound function
function playAudio(ttsData = undefined) {
    let audioPath;
    if (!ttsData) {
        let notfication = undefined;
        if (envInfo.env) {
            notfication = new Audio(path.join(envInfo.path, `./sounds/notifications/${notificationSound.options[config.settings.AUDIO.NOTIFICATION_SOUND].text}`));
        } else {
            notfication = new Audio(path.join(__dirname, `../sounds/notifications/${notificationSound.options[config.settings.AUDIO.NOTIFICATION_SOUND].text}`));
        }
        notfication.play();
    } else {
        add(ttsData);
    }
}

function playVoice(filteredMessage, logoUrl, username, message) {
    trueMessage = filteredMessage;
    currentLogoUrl = logoUrl;
    currentUsername = username;
    let textObject = { "filtered": filteredMessage, "formatted": message };
    let voice;
    const language = langdetect.detect(filteredMessage);

    if (language[0].lang === config.settings.TTS.SECONDARY_TTS_LANGUAGE.toLowerCase()) {
        voice = config.settings.TTS.SECONDARY_TTS_NAME;
        textObject.filtered = `${username}: ${filteredMessage}`;
    } else {
        voice = config.settings.TTS.PRIMARY_TTS_NAME;
        textObject.filtered = `${username}: ${filteredMessage}`;
    }

    talk.add(textObject, voice);
}

module.exports = { playAudio, playVoice };
