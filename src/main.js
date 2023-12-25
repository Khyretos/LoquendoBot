const { app, BrowserWindow, ipcMain } = require('electron');
const { writeIniFile } = require('write-ini-file');
const path = require('path');
const http = require('http');

const ini = require('ini');
const fs = require('fs');

let resourcesPath = __dirname;
let settingsPath;

let settings;
let window;

if (app.isPackaged) {
    settingsPath = path.join(process.resourcesPath, './settings.ini');
    pythonPath = path.join(process.resourcesPath, './backend');
    resourcesPath = process.resourcesPath;
} else {
    settingsPath = path.join(resourcesPath, './config/settings.ini');
    pythonPath = path.join(resourcesPath, './backend');
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

async function createWindow() {
    if (!fs.existsSync(settingsPath)) {
        console.log(resourcesPath);
        await createIniFile();
    } else {
        settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }

    window = new BrowserWindow({
        icon: path.join(__dirname, '/images/icon-512.png'),
        width: parseInt(settings.GENERAL.WIDTH),
        height: parseInt(settings.GENERAL.HEIGHT),
        x: parseInt(settings.GENERAL.POSITION_X),
        y: parseInt(settings.GENERAL.POSITION_Y),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    window.loadFile(path.join(__dirname, 'index.html'));

    if (!app.isPackaged) {
        window.webContents.openDevTools();
    }

    window.on('close', (e) => {
        settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8')); // load newest settings in case anything changed after starting the program
        const bounds = window.getBounds();

        settings.GENERAL.WIDTH = bounds.width;
        settings.GENERAL.HEIGHT = bounds.height;
        settings.GENERAL.POSITION_X = bounds.x;
        settings.GENERAL.POSITION_Y = bounds.y;

        fs.writeFileSync(settingsPath, ini.stringify(settings));
    });
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', (event) => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    window.webContents.send('quit-event');
});

ipcMain.on('resize-window', (event, width, height) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    browserWindow.setSize(width, height);
});

ipcMain.on('minimize-window', (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    browserWindow.minimize();
});

ipcMain.on('maximize-window', (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);

    if (!browserWindow.isMaximized()) {
        browserWindow.maximize();
    } else {
        browserWindow.unmaximize();
    }
});

ipcMain.on('close-window', (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    browserWindow.close();
    app.quit();
});

ipcMain.on('restart', (event) => {
    app.relaunch();
});

ipcMain.on('environment', (event) => {
    event.returnValue = { resourcesPath, pythonPath, settingsPath, settings, isPackaged: app.isPackaged };
});

async function createIniFile() {
    await writeIniFile(settingsPath, {
        GENERAL: {
            VOICE_ENABLED: true,
            NOTIFICATION_ENABLED: true,
            POSITION_X: 0,
            POSITION_Y: 0,
            WIDTH: 1024,
            HEIGHT: 768,
            LANGUAGE: 'EN',
            PORT: 9000,
            VIEWERS_PANEL: false,
            LOCATION: pythonPath,
        },
        LANGUAGE: {
            USE_DETECTION: false,
        },
        TTS: {
            USE_TTS: true,
            PRIMARY_VOICE: '',
            PRIMARY_TTS_LANGUAGE: 'EN',
            SECONDARY_VOICE: '',
            SECONDARY_TTS_LANGUAGE: 'EN',
        },
        STT: {
            USE_STT: false,
            MICROPHONE_ID: 'default',
            SELECTED_MICROPHONE: 'default',
            MICROPHONE: 5,
            LANGUAGE: 'vosk-model-small-es-0.42',
        },
        AUDIO: {
            USE_NOTIFICATION_SOUNDS: true,
            NOTIFICATION_AUDIO_DEVICE: 0,
            NOTIFICATION_SOUND: 0,
            NOTIFICATION_VOLUME: 50,
            SELECTED_TTS_AUDIO_DEVICE: 0,
            TTS_AUDIO_DEVICE: 'default',
            TTS_VOLUME: 50,
        },
        THEME: {
            USE_CUSTOM_THEME: false,
            MAIN_COLOR_1: '#cdc1c1',
            MAIN_COLOR_2: '#b12020',
            MAIN_COLOR_3: '#6c4104',
            MAIN_COLOR_4: '#532d2d',
            TOP_BAR: '#c8ff00',
            MID_SECTION: '#6b8578',
            CHAT_BUBBLE_BG: '#447466',
            CHAT_BUBBLE_HEADER: '#ffffff',
            CHAT_BUBBLE_MESSAGE: '#b5b5b5',
        },
        TWITCH: {
            USE_TWITCH: false,
            CHANNEL_NAME: '',
            USERNAME: 'loquendo',
            OAUTH_TOKEN: '',
            CLIENT_ID: '2t206sj7rvtr1rutob3p627d13jch9',
        },
        MODULES: {
            USE_MODULES: false,
            USE_VTUBER: false,
            USE_CHATBUBBLE: false,
        },
        AMAZON: {
            USE_AMAZON: false,
            ACCESS_KEY: '',
            ACCESS_SECRET: '',
            PRIMARY_VOICE: '',
            SECONDARY_VOICE: '',
            CHARACTERS_USED: 0,
        },
        GOOGLE: {
            USE_GOOGLE: false,
            API_KEY: '',
            PRIMARY_VOICE: '',
            SECONDARY_VOICE: '',
            CHARACTERS_USED: 0,
        },
    }).then(() => {
        settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8'));
    });
}
