const https = require('https');
const querystring = require('querystring');
const aws4 = require('aws4');

class PollyTTS {
	constructor(credentials) {
		this.credentials = credentials;
	}

	textToSpeech(options, callback) {
		if (!options) {
			return callback(new Error('Options are missing'));
		}
		const qs = {
			Text: options.text,
			TextType: options.textType || 'text',
			VoiceId: options.voiceId || 'Vicki',
			SampleRate: options.sampleRate || 22050,
			OutputFormat: options.outputFormat || 'mp3',
		};
		const opts = {
			service: 'polly',
			region: options.region || 'eu-west-1',
			path: `/v1/speech?${querystring.stringify(qs)}`,
			signQuery: true,
		};

		// you can also pass AWS credentials in explicitly (otherwise taken from process.env)
		aws4.sign(opts, this.credentials);
		https
			.get(opts, (res) => {
				if (res.statusCode !== 200) {
					return callback(
						new Error(`Request Failed. Status Code: ${res.statusCode}`),
					);
				}
				callback(null, res);
				return true;
			})
			.on('error', (e) => {
				callback(e);
			});

		return null;
	}

	describeVoices(options, callback) {
		if (!options) {
			return callback(new Error('Options are missing'));
		}
		const qs = {};

		if (options.languageCode) {
			qs.LanguageCode = options.languageCode;
		}

		if (options.nextToken) {
			qs.NextToken = options.nextToken;
		}

		const opts = {
			service: 'polly',
			region: options.region || 'eu-west-1',
			path: `/v1/voices?${querystring.stringify(qs)}`,
			signQuery: true,
		};

		// you can also pass AWS credentials in explicitly (otherwise taken from process.env)
		aws4.sign(opts, this.credentials);
		https
			.get(opts, (res) => {
				if (res.statusCode !== 200) {
					return callback(
						new Error(`Request Failed. Status Code: ${res.statusCode}`),
					);
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

module.exports = PollyTTS;
