const spawn = require('child_process').spawn;
var kill = require('kill-process-by-name');
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
            console.log('Response:', responseData);
            internalVoices = responseData;
        } else {
            console.error('Failed to send termination signal to Flask server.');
        }
    } catch (error) {
        console.error('Error sending termination signal:', error);
    }

    let primaryVoice = document.querySelector('#primaryVoice');
    let secondaryVoice = document.querySelector('#secondaryVoice');

    function setVoicesinSelect(voiceSelect) {
        const voices = Object.values(internalVoices.voices);
        voices.forEach((voice) => {
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

async function getBackendServerStatus() {
    try {
        const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/status`, { method: 'GET' });
        if (response.ok) {
            const responseData = await response.json();
            console.log('Response:', responseData);
        } else {
            console.error('Failed to send termination signal to Flask server.');
        }
    } catch (error) {
        console.error('Error sending termination signal:', error);
    }
}

function startSTT() {
    const eventSource = new EventSource('http://127.0.0.1:9000/stream');

    eventSource.addEventListener('message', (event) => {
        const result = event.data;
        console.log(result); // Log the received data
    });

    eventSource.addEventListener('error', (event) => {
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
            'Content-Type': 'application/json', // Specify the content type
        },
        body: JSON.stringify(requestData), // Convert the data to JSON and include it in the request body
    };

    try {
        const response = await fetch(`http://127.0.0.1:${settings.GENERAL.PORT}/audio`, requestOptions);
        if (response.ok) {
            const responseData = await response.json();
            console.log('Response:', responseData);
            return ttsRequestCount;
        } else {
            console.error('Failed to send termination signal to Flask server.');
        }
    } catch (error) {
        console.error('Error sending termination signal:', error);
    }
}

const createBackendServer = () =>
    new Promise((resolve) => {
        if (main.isPackaged) {
            python = spawn(path.join(pythonPath, './loquendoBot_backend.exe'), [settingsPath, 'prod']);
        } else {
            python = spawn('python', ['-u', path.join(pythonPath, './loquendoBot_backend.py'), settingsPath, 'dev']);
        }
        // Capture the stdout of the Python process
        python.stdout.on('data', (data) => {
            console.info(`${data}`);
        });

        // Capture the stderr of the Python process
        python.stderr.on('data', (data) => {
            console.error(`${data}`);
            resolve('finished'); // cannot get it to resolve with stdout
        });

        // Listen for the Python process to exit
        python.on('close', (code) => {
            console.log(`Python process exited with code ${code}`);
        });

        if (typeof python.pid !== 'number') {
            console.log('failed');
        } else {
            console.log(`Spawned subprocess correctly!, PID = ${python.pid}`);
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

//TODO: convert to restartServer function
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

module.exports = { getInternalTTSAudio };
