function setTheme(USE_CUSTOM_THEME) {
	document.querySelector('#MAIN_COLOR_1').value = config.settings.THEME.MAIN_COLOR_1;
	const MAIN_COLOR_1 = document.querySelector('#MAIN_COLOR_1').value;
	root.style.setProperty('--main-color1-temp', MAIN_COLOR_1);

	document.querySelector('#MAIN_COLOR_2').value = config.settings.THEME.MAIN_COLOR_2;
	const MAIN_COLOR_2 = document.querySelector('#MAIN_COLOR_2').value;
	root.style.setProperty('--main-color2-temp', MAIN_COLOR_2);

	document.querySelector('#MAIN_COLOR_3').value = config.settings.THEME.MAIN_COLOR_3;
	const MAIN_COLOR_3 = document.querySelector('#MAIN_COLOR_3').value;
	root.style.setProperty('--main-color3-temp', MAIN_COLOR_3);

	document.querySelector('#MAIN_COLOR_4').value = config.settings.THEME.MAIN_COLOR_4;
	const MAIN_COLOR_4 = document.querySelector('#MAIN_COLOR_4').value;
	root.style.setProperty('--main-color4-temp', MAIN_COLOR_4);

	document.querySelector('#TOP_BAR').value = config.settings.THEME.TOP_BAR;
	const TOP_BAR = document.querySelector('#TOP_BAR').value;
	root.style.setProperty('--top-bar-temp', TOP_BAR);

	document.querySelector('#MID_SECTION').value = config.settings.THEME.MID_SECTION;
	const MID_SECTION = document.querySelector('#MID_SECTION').value;
	root.style.setProperty('--mid-section-temp', MID_SECTION);

	document.querySelector('#CHAT_BUBBLE_BG').value = config.settings.THEME.CHAT_BUBBLE_BG;
	const CHAT_BUBBLE_BG = document.querySelector('#CHAT_BUBBLE_BG').value;
	root.style.setProperty('--chat-bubble-temp', CHAT_BUBBLE_BG);

	document.querySelector('#CHAT_BUBBLE_HEADER').value = config.settings.THEME.CHAT_BUBBLE_HEADER;
	const CHAT_BUBBLE_HEADER = document.querySelector('#CHAT_BUBBLE_HEADER').value;
	root.style.setProperty('--chat-bubble-header-temp', CHAT_BUBBLE_HEADER);

	document.querySelector('#CHAT_BUBBLE_MESSAGE').value = config.settings.THEME.CHAT_BUBBLE_MESSAGE;
	const CHAT_BUBBLE_MESSAGE = document.querySelector('#CHAT_BUBBLE_MESSAGE').value;
	root.style.setProperty('--chat-bubble-message-temp', CHAT_BUBBLE_MESSAGE);

	if (USE_CUSTOM_THEME) {
		root.style.setProperty('--main-color1', MAIN_COLOR_1);

		root.style.setProperty('--main-color2', MAIN_COLOR_2);

		root.style.setProperty('--main-color3', MAIN_COLOR_3);

		root.style.setProperty('--main-color4', MAIN_COLOR_4);

		root.style.setProperty('--top-bar', TOP_BAR);

		root.style.setProperty('--mid-section', MID_SECTION);

		root.style.setProperty('--chat-bubble', CHAT_BUBBLE_BG);

		root.style.setProperty('--chat-bubble-header', CHAT_BUBBLE_HEADER);

		root.style.setProperty('--chat-bubble-message', CHAT_BUBBLE_MESSAGE);
	} else {
		root.style.setProperty('--main-color1', '#6e2c8c');

		root.style.setProperty('--main-color2', 'white');

		root.style.setProperty('--main-color3', '#211E1E');

		root.style.setProperty('--main-color4', '#2f2c34');

		root.style.setProperty('--top-bar', '#100B12');

		root.style.setProperty('--mid-section', '#352d3d');

		root.style.setProperty('--chat-bubble', ' #7A6D7F');

		root.style.setProperty('--chat-bubble-header', '#141414');

		root.style.setProperty('--chat-bubble-message', 'white');
	}
}

// #region Save Theme
document.body.querySelector('#MAIN_COLOR_1').addEventListener('input', () => {
	const x = document.getElementById('MAIN_COLOR_1').value;
	root.style.setProperty('--main-color1-temp', x);
});

document.body.querySelector('#MAIN_COLOR_1').addEventListener('change', () => {
	config.settings.THEME.MAIN_COLOR_1 = document.getElementById('MAIN_COLOR_1').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#MAIN_COLOR_2').addEventListener('input', () => {
	const x = document.getElementById('MAIN_COLOR_2').value;
	root.style.setProperty('--main-color2-temp', x);
});

document.body.querySelector('#MAIN_COLOR_2').addEventListener('change', () => {
	config.settings.THEME.MAIN_COLOR_2 = document.getElementById('MAIN_COLOR_2').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#MAIN_COLOR_3').addEventListener('input', () => {
	const x = document.getElementById('MAIN_COLOR_3').value;
	root.style.setProperty('--main-color3-temp', x);
});

document.body.querySelector('#MAIN_COLOR_3').addEventListener('change', () => {
	config.settings.THEME.MAIN_COLOR_3 = document.getElementById('MAIN_COLOR_3').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#MAIN_COLOR_4').addEventListener('input', () => {
	const x = document.getElementById('MAIN_COLOR_4').value;
	root.style.setProperty('--main-color4-temp', x);
});

document.body.querySelector('#MAIN_COLOR_4').addEventListener('change', () => {
	config.settings.THEME.MAIN_COLOR_4 = document.getElementById('MAIN_COLOR_4').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#TOP_BAR').addEventListener('input', () => {
	const x = document.getElementById('TOP_BAR').value;
	root.style.setProperty('--top-bar-temp', x);
});

document.body.querySelector('#TOP_BAR').addEventListener('change', () => {
	config.settings.THEME.TOP_BAR = document.getElementById('TOP_BAR').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#MID_SECTION').addEventListener('input', () => {
	const x = document.getElementById('MID_SECTION').value;
	root.style.setProperty('--mid-section-temp', x);
});

document.body.querySelector('#MID_SECTION').addEventListener('change', () => {
	config.settings.THEME.MID_SECTION = document.getElementById('MID_SECTION').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#CHAT_BUBBLE_BG').addEventListener('input', () => {
	const x = document.getElementById('CHAT_BUBBLE_BG').value;
	root.style.setProperty('--chat-bubble-temp', x);
});

document.body.querySelector('#CHAT_BUBBLE_BG').addEventListener('change', () => {
	config.settings.THEME.CHAT_BUBBLE_BG = document.getElementById('CHAT_BUBBLE_BG').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#CHAT_BUBBLE_HEADER').addEventListener('input', () => {
	const x = document.getElementById('CHAT_BUBBLE_HEADER').value;
	root.style.setProperty('--chat-bubble-header-temp', x);
});

document.body.querySelector('#CHAT_BUBBLE_HEADER').addEventListener('change', () => {
	config.settings.THEME.CHAT_BUBBLE_HEADER = document.getElementById('CHAT_BUBBLE_HEADER').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

document.body.querySelector('#CHAT_BUBBLE_MESSAGE').addEventListener('input', () => {
	const x = document.getElementById('CHAT_BUBBLE_MESSAGE').value;
	root.style.setProperty('--chat-bubble-message-temp', x);
});

document.body.querySelector('#CHAT_BUBBLE_MESSAGE').addEventListener('change', () => {
	config.settings.THEME.CHAT_BUBBLE_MESSAGE = document.getElementById('CHAT_BUBBLE_MESSAGE').value;
	fs.writeFileSync(path.join(__dirname, '../config/settings.ini'), config.ini.stringify(config.settings));
	setTheme(config.settings.THEME.USE_CUSTOM_THEME);
});

// #endregion

module.exports = { setTheme };
