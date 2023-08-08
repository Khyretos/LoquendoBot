let SelectedVoice = '';
let Encoding = '';
let counter = 0;
// wrap in promise
const speak = (textObject) =>
    new Promise((resolve) => {
        // say.setEncoding(Encoding);
        counter += 1;
        let savePath = path.join(resourcesPath, './sounds/tts/internal_audio_' + counter + '.mp3');

        say.export(textObject.filtered, SelectedVoice, 1, savePath, (err) => {
            if (err) {
                console.error(err);
            } else {
                sound.playAudio({ path: savePath, message: textObject });
                sound.playNotificationSound();
            }
            resolve('finished');
        });
    });

// queue system
class SayQueue {
    constructor() {
        this.messages = [];
        this.status = 0;
    }

    async shift() {
        this.status = 1;
        while (this.messages.length > 0) {
            await speak(this.messages.shift(), SelectedVoice, 1);
        }
        this.status = 0;
    }

    add(message, selectedVoice) {
        this.messages.push(message);
        SelectedVoice = selectedVoice;
        if (this.status === 0) {
            this.shift();
        }
    }
}

const sayQueue = new SayQueue();
module.exports = sayQueue;
