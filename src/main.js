const { app, shell, BrowserWindow, ipcMain } = require('electron');
const { writeIniFile } = require('write-ini-file');
const path = require('path');

const ini = require('ini');
const fs = require('fs');

let resourcesPath = __dirname;
let settingsPath;

let settings;
let window;

if (app.isPackaged) {
    settingsPath = path.join(process.resourcesPath, './settings.ini');
    resourcesPath = process.resourcesPath;
} else {
    settingsPath = path.join(resourcesPath, './config/settings.ini');
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
        icon: path.join(__dirname, '/images/icon.png'),
        width: parseInt(settings.SETTINGS.WIDTH),
        height: parseInt(settings.SETTINGS.HEIGHT),
        x: parseInt(settings.SETTINGS.POSITION_X),
        y: parseInt(settings.SETTINGS.POSITION_Y),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });
    window.loadURL('https://github.com');

    window.loadFile(path.join(__dirname, 'index.html'));

    if (!app.isPackaged) {
        window.webContents.openDevTools();
    }

    window.on('close', (e) => {
        settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8')); // load newest settings in case anything changed after starting the program
        const bounds = window.getBounds();

        settings.SETTINGS.WIDTH = bounds.width;
        settings.SETTINGS.HEIGHT = bounds.height;
        settings.SETTINGS.POSITION_X = bounds.x;
        settings.SETTINGS.POSITION_Y = bounds.y;

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
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
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
    event.returnValue = { resourcesPath: resourcesPath, settingsPath: settingsPath, settings: settings, isPackaged: app.isPackaged };
});

let twitchAuthentication = () =>
    new Promise((resolve) => {
        const http = require('http');
        const redirectUri = 'http://localhost:1989/auth';
        const scopes = ['chat:edit', 'chat:read'];

        const express = require('express');
        let tempAuthServer = express();
        const port = 1989;

        const { parse: parseQueryString } = require('querystring');

        tempAuthServer.use(function (req, res, next) {
            if (req.url !== '/auth') {
                let token = parseQueryString(req.query.auth);
                settings.TWITCH.OAUTH_TOKEN = token['#access_token'];
                fs.writeFileSync(settingsPath, ini.stringify(settings));
                settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8'));
                resolve('finished');
                stopServer();
            }
            next();
        });

        function stopServer() {
            tempAuthServer.close();
        }

        const htmlString = `
	  <!DOCTYPE html>
	  <html>
	    <head>
	      <title>Authentication</title>
	    </head>
	    <body>
	      <h1>Authentication successful! You can close this window now.</h1>
			  <form name="auth" "action="auth" method="get" >
			    <input type="text" id="auth" name="auth"/>
			    <input type="submit" />
			</form>
	    </body>
	  </html>
	  <script>
	  function onSubmitComplete() {
		  		  close();
		}
		  document.querySelector("#auth").value = document.location.hash;
		  document.auth.submit();
		  setTimeout(onSubmitComplete, 500); 
	  </script>
	`;

        tempAuthServer.get('/auth', (req, res) => {
            res.send(htmlString);
        });

        tempAuthServer.post('/auth', (req, res) => {
            res.render('authentication', { name: req.body.name });
        });

        const server = http.createServer(tempAuthServer);

        server.listen(port, () => {
            const authURL = `https://id.twitch.tv/oauth2/authorize?client_id=${settings.TWITCH.CLIENT_ID}&redirect_uri=${encodeURIComponent(
                redirectUri,
            )}&response_type=token&scope=${scopes.join(' ')}`;
            shell.openExternal(authURL);
        });

        function stopServer() {
            server.close(() => {});
        }
    });

ipcMain.on('twitch', async (event) => {
    await twitchAuthentication();
    event.returnValue = settings.TWITCH.OAUTH_TOKEN;
});

ipcMain.on('vtuber', async (event) => {
    shell.openExternal(`http://localhost:${settings.SERVER.PORT}/vtuber/`);
});

ipcMain.on('chatBubble', async (event) => {
    shell.openExternal(`http://localhost:${settings.SERVER.PORT}/chat/`);
});

async function createIniFile() {
    await writeIniFile(settingsPath, {
        SETTINGS: {
            VOICE_ENABLED: true,
            NOTIFICATION_ENABLED: true,
            POSITION_X: 0,
            POSITION_Y: 0,
            WIDTH: 1024,
            HEIGHT: 768,
            LANGUAGE: 'EN',
        },
        TTS: {
            USE_TTS: true,
            PRIMARY_TTS_VOICE: 0,
            PRIMARY_TTS_NAME: '',
            PRIMARY_TTS_LANGUAGE: 'EN',
            PRIMARY_TTS_LANGUAGE_INDEX: 0,
            SECONDARY_TTS_VOICE: 0,
            SECONDARY_TTS_NAME: '',
            SECONDARY_TTS_LANGUAGE: 'EN',
            SECONDARY_TTS_LANGUAGE_INDEX: 0,
            TTS_VOLUME: 50,
        },
        AUDIO: {
            USE_NOTIFICATION_SOUNDS: true,
            NOTIFICATION_AUDIO_DEVICE: 0,
            NOTIFICATION_SOUND: 0,
            NOTIFICATION_VOLUME: 50,
            SELECTED_TTS_AUDIO_DEVICE: 0,
            TTS_AUDIO_DEVICE: 'default',
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
        SERVER: {
            USE_SERVER: false,
            PORT: '9000',
            USE_VTUBER: false,
            USE_CHATBUBBLE: false,
        },
        AMAZON: {
            USE_TWITCH: false,
            ACCESS_KEY: '',
            ACCESS_SECRET: '',
        },
        GOOGLE: {
            USE_GOOGLE: false,
            API_KEY: '',
        },
    }).then(() => {
        settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8'));
    });
}
