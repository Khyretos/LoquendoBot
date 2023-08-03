function getResponse() {
	const userText = document.querySelector('#textInput').value;

	// If nothing is written don't do anything
	if (userText === '') {
		return;
	}

	// Create chat message from received data
	const article = document.createElement('article');
	article.className = 'msg-container msg-self';

	article.innerHTML = messageTemplates.userTemplate;

	const postTime = article.querySelector('.post-time');
	if (postTime) {
		postTime.innerText = getPostTime();
	}

	const msg = article.querySelector('.msg');
	if (msg) {
		msg.innerText = userText;
	}

	// Appends the message to the main chat box (shows the message)
	showChatMessage(article);

	twitch.sendMessage(userText);

	// Empty input box after sending message
	document.body.querySelector('#textInput').value = '';
}

// Function that will execute when you press 'enter' in the message box
document.body.querySelector('#textInput').addEventListener('keydown', (e) => {
	if (e.which === 13) {
		getResponse();
	}
});

// Function that will execute when you click the 'send' button
document.body.querySelector('#SendButton').addEventListener('click', () => {
	getResponse();
});

// #endregion

// #region Panel retraction function

// Left panel
document.body.querySelector('.circle-left').addEventListener('click', () => {
	const menu = document.body.querySelector('.sidepanel-left');

	if (menu.classList.contains('collapse-menu')) {
		menu.classList.remove('collapse-menu');
	} else {
		menu.classList.add('collapse-menu');
	}

	const leftCircle = document.body.querySelector('.circle-left');

	if (leftCircle.classList.contains('collapse-circle-left')) {
		leftCircle.classList.remove('collapse-circle-left');
	} else {
		leftCircle.classList.add('collapse-circle-left');
	}
});

// right panel
document.body.querySelector('.circle-right').addEventListener('click', () => {
	const menu = document.body.querySelector('.sidepanel-right');

	if (menu.classList.contains('collapse-menu')) {
		menu.classList.remove('collapse-menu');
	} else {
		menu.classList.add('collapse-menu');
	}

	const leftCircle = document.body.querySelector('.circle-right');

	if (leftCircle.classList.contains('collapse-circle-right')) {
		leftCircle.classList.remove('collapse-circle-right');
	} else {
		leftCircle.classList.add('collapse-circle-right');
	}
});

// #endregion

// #region Show panels

// TODO: animate Option panels
// TODO : optimize show panels
// Function that shows and hides the option panels. (TTS, Configuration, Commands)
const displayPanel = (panelSelectorClass, panelSelectorID, btnSelectorID) => {
	const btn = document.querySelector(btnSelectorID);
	const panel = document.querySelector(panelSelectorID);
	const panels = document.querySelectorAll(panelSelectorClass);

	btn.addEventListener('click', (event) => {
		event.stopPropagation();
		panels.forEach((el) => {
			if (el === panel) return;
			el.classList.remove('show');
		});
		if (panel.classList.contains('show')) {
			// panel.classList.remove('show');
		} else {
			panel.classList.add('show');
		}
	}, {
		capture: true,
	});
};

displayPanel('.OptionPanel', '#Configuration', '#btnConfiguration');
displayPanel('.OptionPanel', '#Logs', '#btnLogs');
displayPanel('.OptionPanel', '#BrowsersourceChat', '#btnBrowsersourceChat');
displayPanel('.OptionPanel', '#BrowsersourceVtuber', '#btnBrowsersourceVtuber');
displayPanel('.OptionPanel', '#TTS', '#btnTTS');
displayPanel('.OptionPanel', '#Chat', '#btnChat');
// #endregion

const displayPanelX = (panelSelectorClass, panelSelectorID, btnSelectorID) => {
	const btn = document.querySelector(btnSelectorID);
	const panel = document.querySelector(panelSelectorID);
	const panels = document.querySelectorAll(panelSelectorClass);

	btn.addEventListener('click', (event) => {
		event.stopPropagation();
		panels.forEach((el) => {
			if (el === panel) return;
			el.classList.remove('item-active');
		});
		if (panel.classList.contains('item-active')) {
			// panel.classList.remove('item-active');
		} else {
			panel.classList.add('item-active');
		}
	}, {
		capture: true,
	});
};

displayPanelX('.item', '#btnTTS', '#btnTTS');
displayPanelX('.item', '#btnChat', '#btnChat');
displayPanelX('.item', '#btnBrowsersourceChat', '#btnBrowsersourceChat');
displayPanelX('.item', '#btnBrowsersourceVtuber', '#btnBrowsersourceVtuber');
displayPanelX('.item', '#btnLogs', '#btnLogs');
displayPanelX('.item', '#btnConfiguration', '#btnConfiguration');


// #region Show/Hide Advanced Menu
document.body.querySelector('#ShowAdvancedMenu').addEventListener('click', () => {
	document.getElementById('AdvancedMenu_mask').style.visibility = 'visible';
});

document.body.querySelector('#HideAdvancedMenu').addEventListener('click', () => {
	document.getElementById('AdvancedMenu_mask').style.visibility = 'hidden';
});

// #endregion

// #region Show/Hide Theme Creator
document.body.querySelector('#ShowThemeCreator').addEventListener('click', () => {
	document.getElementById('ThemeCreator_mask').style.visibility = 'visible';
});

document.body.querySelector('#HideThemeCreator').addEventListener('click', () => {
	document.getElementById('ThemeCreator_mask').style.visibility = 'hidden';
});

// #endregion

// #region Test/Save TTS
document.body.querySelector('#TTSTestButton').addEventListener('click', () => {
	const text = document.getElementById('TTSTest').value;
	console.log(text);
	sound.playVoice(text, '', '', text);
});
