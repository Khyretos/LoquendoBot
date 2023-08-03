const { app, BrowserWindow, ipcMain } = require('electron');
const { writeIniFile } = require('write-ini-file')
const path = require('path');

const ini = require('ini');
const fs = require('fs');

let resourcesPath;
let settings;
let window;

if (app.isPackaged) {
	resourcesPath = path.join(process.resourcesPath, './settings.ini');
} else {
	resourcesPath = path.join(__dirname, './config/settings.ini');
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

async function createWindow() {
	if (!fs.existsSync(resourcesPath)) {
		await createIniFile(resourcesPath);
	} else {
		settings = ini.parse(fs.readFileSync(resourcesPath, 'utf-8'));
	}

	window = new BrowserWindow({
		icon: path.join(__dirname, '/images/icon.png'),
		width: parseInt(settings.SETTINGS.WIDTH),
		height: parseInt(settings.SETTINGS.HEIGHT),
		minHeight: 800,
		minWidth: 600,
		x: parseInt(settings.SETTINGS.POSITION_X),
		y: parseInt(settings.SETTINGS.POSITION_Y),
		frame: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	});
	window.loadURL('https://github.com')


	window.loadFile(path.join(__dirname, 'index.html'));

	window.webContents.openDevTools();

	window.on('close', e => {
		const bounds = window.getBounds();

		settings.SETTINGS.WIDTH = bounds.width;
		settings.SETTINGS.HEIGHT = bounds.height;
		settings.SETTINGS.POSITION_X = bounds.x;
		settings.SETTINGS.POSITION_Y = bounds.y;

		fs.writeFileSync(resourcesPath, ini.stringify(settings));
	})

};

app.whenReady().then(() => {
	createWindow();
})

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

ipcMain.on('environment', (event) => {
	event.returnValue = { "env": app.isPackaged, "path": process.resourcesPath };
});

async function createIniFile() {
	await writeIniFile(resourcesPath, {
		SETTINGS: {
			VOICE_ENABLED: true,
			NOTIFICATION_ENABLED: true,
			POSITION_X: 0,
			POSITION_Y: 0,
			WIDTH: 600,
			HEIGHT: 800
		},
		TTS: {
			SELECTED_TTS: "InternalTTS",
			INTERNAL_TTS_VOICE: 0,
			GOOGLE_VOICE: 0,
			AMAZON_VOICE: 0
		},
		AUDIO: {
			NOTIFICATION_AUDIO_DEVICE: 0,
			NOTIFICATION_SOUND: 0,
			NOTIFICATION_VOLUME: 100,
			SELECTED_TTS_AUDIO_DEVICE: 0,
			TTS_AUDIO_DEVICE: "",
			TTS_VOLUME: 100
		},
		THEME: {
			USE_CUSTOM_THEME: false,
			MAIN_COLOR_1: "\#cdc1c1",
			MAIN_COLOR_2: "\#b12020",
			MAIN_COLOR_3: "\#6c4104",
			MAIN_COLOR_4: "\#532d2d",
			TOP_BAR: "\#c8ff00",
			MID_SECTION: "\#6b8578",
			CHAT_BUBBLE_BG: "\#447466",
			CHAT_BUBBLE_HEADER: "\#ffffff",
			CHAT_BUBBLE_MESSAGE: "\#b5b5b5",
		},
		TWITCH: {
			USE_TWITCH: true,
			CHANNEL_NAME: "khyretos",
			USERNAME: "loquendo",
			OAUTH_TOKEN: "",
			CLIENT_ID: "",
			CLIENT_SECRET: "",
		},
		AMAZON: {
			ACCESS_KEY: "",
			ACCESS_SECRET: "",
		}
	}).then(() => {
		settings = ini.parse(fs.readFileSync(resourcesPath, 'utf-8'));
	})
}