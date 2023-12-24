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

    if (menu.classList.contains('collapse-menu-left')) {
        menu.classList.remove('collapse-menu-left');
    } else {
        menu.classList.add('collapse-menu-left');
    }

    const leftCircle = document.body.querySelector('.circle-left');

    if (leftCircle.classList.contains('collapse-circle-left')) {
        leftCircle.classList.remove('collapse-circle-left');
    } else {
        leftCircle.classList.add('collapse-circle-left');
    }
});

// #region Show panels

// TODO: animate Option panels
// TODO : optimize show panels
// Function that shows and hides the option panels. (TTS, Configuration, Commands)
const displayPanel = (panelSelectorClass, panelSelectorID, btnSelectorID) => {
    const btn = document.querySelector(btnSelectorID);
    const panel = document.querySelector(panelSelectorID);
    const panels = document.querySelectorAll(panelSelectorClass);

    btn.addEventListener(
        'click',
        (event) => {
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
        },
        {
            capture: true,
        },
    );
};

displayPanel('.OptionPanel', '#Configuration', '#btnConfiguration');
displayPanel('.OptionPanel', '#Logs', '#btnLogs');
displayPanel('.OptionPanel', '#BrowsersourceChat', '#btnBrowsersourceChat');
displayPanel('.OptionPanel', '#BrowsersourceVtuber', '#btnBrowsersourceVtuber');
displayPanel('.OptionPanel', '#Chat', '#btnChat');
displayPanel('.OptionPanel', '#ThemeCreator', '#btnThemeCreator');
displayPanel('.OptionPanel', '#ChatCreator', '#btnChatCreator');
// displayPanel('.OptionPanel', '#Info', '#btnInfo');
// #endregion

const displayPanelX = (panelSelectorClass, panelSelectorID, btnSelectorID) => {
    const btn = document.querySelector(btnSelectorID);
    const panel = document.querySelector(panelSelectorID);
    const panels = document.querySelectorAll(panelSelectorClass);

    btn.addEventListener(
        'click',
        (event) => {
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
        },
        {
            capture: true,
        },
    );
};

displayPanelX('.item', '#btnChat', '#btnChat');
displayPanelX('.item', '#btnBrowsersourceChat', '#btnBrowsersourceChat');
displayPanelX('.item', '#btnBrowsersourceVtuber', '#btnBrowsersourceVtuber');
displayPanelX('.item', '#btnLogs', '#btnLogs');
displayPanelX('.item', '#btnConfiguration', '#btnConfiguration');
displayPanelX('.item', '#btnThemeCreator', '#btnThemeCreator');
displayPanelX('.item', '#btnChatCreator', '#btnChatCreator');

// #region Show/Hide Theme Creator

// #endregion
