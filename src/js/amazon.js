const https = require('https');
const querystring = require('querystring');
const aws4 = require('aws4');

function getAmazonVoices() {
    if (!settings.AMAZON.USE_AMAZON) {
        callback();
        return;
    }

    addVoiceService('Amazon');

    let primaryVoice = document.querySelector('#primaryAmazonVoice');
    let secondaryVoice = document.querySelector('#secondaryAmazonVoice');

    function setVoicesinSelect(voiceSelect) {
        const voices = Object.values(amazonVoices);
        voices.forEach((voice) => {
            const option = document.createElement('option');
            option.classList.add('option');

            option.value = voice;
            option.innerHTML = voice;

            voiceSelect.appendChild(option);
        });
    }
    setVoicesinSelect(primaryVoice);
    primaryVoice.value = settings.AMAZON.PRIMARY_VOICE;
    setVoicesinSelect(secondaryVoice);
    secondaryVoice.value = settings.AMAZON.SECONDARY_VOICE;
}

if (settings.AMAZON.USE_AMAZON) {
    getAmazonVoices();
}

class PollyTTS {
    constructor() {}

    textToSpeech(options, callback) {
        if (!options) {
            return callback(new Error('Options are missing'));
        }

        const qs = {
            Text: options.text,
            TextType: options.textType || 'text',
            VoiceId: options.voiceId || 'Mia',
            SampleRate: options.sampleRate || 22050,
            OutputFormat: options.outputFormat || 'mp3',
            Engine: options.engine || 'neural',
        };

        const opts = {
            service: 'polly',
            region: options.region || 'us-east-1',
            path: `/v1/speech?${querystring.stringify(qs)}`,
            signQuery: true,
        };

        // you can also pass AWS credentials in explicitly (otherwise taken from process.env)
        aws4.sign(opts, this.credentials);
        https
            .get(opts, (res) => {
                if (res.statusCode !== 200) {
                    return callback(new Error(`Request Failed. Status Code: ${res.statusCode}`));
                }
                callback(null, res);
                return true;
            })
            .on('error', (e) => {
                callback(e);
            });

        return null;
    }

    describeVoices(callback, credentials) {
        this.credentials = credentials;
        const qs = {
            Engine: 'neural',
        };

        const opts = {
            service: 'polly',
            region: 'us-east-1',
            path: `/v1/voices?${querystring.stringify(qs)}`,
            signQuery: true,
        };

        // you can also pass AWS credentials in explicitly (otherwise taken from process.env)
        aws4.sign(opts, this.credentials);
        https
            .get(opts, (res) => {
                if (res.statusCode !== 200) {
                    return callback(new Error(`Request Failed. Status Code: ${res.statusCode}`));
                }

                let body = '';
                res.on('readable', () => {
                    body += res.read();
                });
                res.on('end', () => {
                    callback(null, body);
                });

                return undefined;
            })
            .on('error', (e) => {
                callback(e);
            });

        return null;
    }
}

const pollyTTS = new PollyTTS();
module.exports = pollyTTS;
