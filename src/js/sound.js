let trueMessage = '';
let currentLogoUrl = '';
let currentUsername = '';
let voiceSoundArray = [];
let status = 0;
let counter = 0;

const playTTS = (data) =>
    new Promise((resolve) => {
        ttsAudioFile = path.join(resourcesPath, `./sounds/tts/${data.service}_${data.count}.mp3`);
        const tts = new Audio(ttsAudioFile);
        console.log(settings.AUDIO.TTS_AUDIO_DEVICE);
        tts.setSinkId(settings.AUDIO.TTS_AUDIO_DEVICE);

        tts.addEventListener('ended', () => {
            console.log('ended');
            fs.unlink(ttsAudioFile, (err) => {
                if (err) {
                    console.error('TEST');

                    resolve('finished');
                    return;
                }
                resolve('finished');
            });
        });

        tts.setSinkId(settings.AUDIO.TTS_AUDIO_DEVICE)
            .then(() => {
                console.log('playing');
                tts.volume = settings.AUDIO.TTS_VOLUME / 100;
                tts.play().catch((error) => {
                    resolve('finished');
                });
            })
            .catch((error) => {
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
        let notfication = new Audio(
            path.join(resourcesPath, `./sounds/notifications/${notificationSound.options[settings.AUDIO.NOTIFICATION_SOUND].text}`),
        );
        notfication.volume = settings.AUDIO.NOTIFICATION_VOLUME / 100;
        notfication.play();
    }
}

// Play sound function
function playAudio(data) {
    if (data.service !== '') {
        add(data);
    }
}

async function playVoice(filteredMessage, logoUrl, username, message) {
    trueMessage = filteredMessage;
    currentLogoUrl = logoUrl;
    currentUsername = username;
    let textObject = { filtered: filteredMessage, formatted: message };
    let voice;
    textObject.filtered = `${username}: ${filteredMessage}`;

    // if (
    //     settings.TTS.PRIMARY_TTS_LANGUAGE.toLowerCase() !== settings.TTS.SECONDARY_TTS_LANGUAGE.toLowerCase() &&
    //     language[0].lang === settings.TTS.SECONDARY_TTS_LANGUAGE.toLowerCase()
    // ) {
    //     voice = settings.TTS.SECONDARY_TTS_NAME;
    //     textObject.filtered = `${username}: ${filteredMessage}`;
    // } else {
    //     voice = settings.TTS.PRIMARY_TTS_NAME;
    //     textObject.filtered = `${username}: ${filteredMessage}`;
    // }

    const service = document.getElementById('primaryTTSService').value;

    switch (service) {
        case 'Internal':
            const requestData = {
                message: textObject.filtered,
                voice: settings.TTS.PRIMARY_VOICE,
            };

            let count = await backend.getInternalTTSAudio(requestData);
            playAudio({ service, message: textObject, count });
            break;
        case 'Amazon':
            // playAudio({ service: 'Amazon', message: textObject, count });
            break;
        case 'Google':
            // playAudio({ service: 'Google', message: textObject, count });
            break;
    }

    if (settings.MODULES.USE_CHATBUBBLE) {
        socket.emit('xxx', currentLogoUrl, currentUsername, textObject);
    }

    playNotificationSound();
}

module.exports = { playAudio, playVoice, playNotificationSound };
