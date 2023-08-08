let trueMessage = '';
let currentLogoUrl = '';
let currentUsername = '';
let voiceSoundArray = [];
let status = 0;

const playTTS = (ttsData) =>
    new Promise((resolve) => {
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

        tts.setSinkId(settings.AUDIO.TTS_AUDIO_DEVICE)
            .then(() => {
                tts.volume = settings.TTS.TTS_VOLUME / 100;
                tts.play();

                if (settings.SERVER.USE_SERVER) {
                    socket.emit('xxx', currentLogoUrl, currentUsername, ttsData.message);
                }
            })
            .catch((error) => {
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

function playNotificationSound() {
    if (settings.AUDIO.USE_NOTIFICATION_SOUNDS) {
        let notfication = new Audio(
            path.join(resourcesPath, `./sounds/notifications/${notificationSound.options[settings.AUDIO.NOTIFICATION_SOUND].text}`),
        );
        notfication.volume = settings.AUDIO.NOTIFICATION_VOLUME / 100;
        notfication.play();
    }
}

// Play sound function
function playAudio(data) {
    if (settings.TTS.USE_TTS) {
        add(data);
    } else if (settings.SERVER.USE_SERVER && settings.SERVER.USE_CHATBUBBLE) {
        socket.emit('xxx', currentLogoUrl, currentUsername, data);
    }
}

function playVoice(filteredMessage, logoUrl, username, message) {
    trueMessage = filteredMessage;
    currentLogoUrl = logoUrl;
    currentUsername = username;
    let textObject = { filtered: filteredMessage, formatted: message };
    let voice;
    const language = langdetect.detect(filteredMessage);

    if (
        settings.TTS.PRIMARY_TTS_LANGUAGE.toLowerCase() !== settings.TTS.SECONDARY_TTS_LANGUAGE.toLowerCase() ||
        language[0].lang === settings.TTS.SECONDARY_TTS_LANGUAGE.toLowerCase()
    ) {
        voice = settings.TTS.SECONDARY_TTS_NAME;
        textObject.filtered = `${username}: ${filteredMessage}`;
    } else {
        voice = settings.TTS.PRIMARY_TTS_NAME;
        textObject.filtered = `${username}: ${filteredMessage}`;
    }

    if (settings.TTS.USE_TTS) {
        talk.add(textObject, voice);
    } else {
        playNotificationSound();
    }
}

module.exports = { playAudio, playVoice, playNotificationSound };
