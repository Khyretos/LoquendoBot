function changeColor(section, setting, tempSection) {
    document.querySelector(section).value = setting;
    const value = document.querySelector(section).value;
    root.style.setProperty(tempSection, value);
}

function setCurrentTheme(adjustTemp = false) {
    changeColor('#MAIN_COLOR_1', settings.THEME.MAIN_COLOR_1, adjustTemp ? '--main-color1-temp' : '--main-color1');
    changeColor('#MAIN_COLOR_2', settings.THEME.MAIN_COLOR_2, adjustTemp ? '--main-color2-temp' : '--main-color2');
    changeColor('#MAIN_COLOR_3', settings.THEME.MAIN_COLOR_3, adjustTemp ? '--main-color3-temp' : '--main-color3');
    changeColor('#MAIN_COLOR_4', settings.THEME.MAIN_COLOR_4, adjustTemp ? '--main-color4-temp' : '--main-color4');
    changeColor('#TOP_BAR', settings.THEME.TOP_BAR, adjustTemp ? '--top-bar-temp' : '--top-bar');
    changeColor('#MID_SECTION', settings.THEME.MID_SECTION, adjustTemp ? '--mid-section-temp' : '--mid-section');
    changeColor('#CHAT_BUBBLE_BG', settings.THEME.CHAT_BUBBLE_BG, adjustTemp ? '--chat-bubble-temp' : '--chat-bubble');
    changeColor(
        '#CHAT_BUBBLE_HEADER',
        settings.THEME.CHAT_BUBBLE_HEADER,
        adjustTemp ? '--chat-bubble-header-temp' : '--chat-bubble-header',
    );
    changeColor(
        '#CHAT_BUBBLE_MESSAGE',
        settings.THEME.CHAT_BUBBLE_MESSAGE,
        adjustTemp ? '--chat-bubble-message-temp' : '--chat-bubble-message',
    );
}

setCurrentTheme(true);

function setTheme() {
    if (settings.THEME.USE_CUSTOM_THEME) {
        setCurrentTheme();
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

document.body.querySelector('#MAIN_COLOR_1').addEventListener('input', () => {
    const x = document.getElementById('MAIN_COLOR_1').value;
    root.style.setProperty('--main-color1-temp', x);
    console.log(x);
});

document.body.querySelector('#MAIN_COLOR_1').addEventListener('change', () => {
    settings.THEME.MAIN_COLOR_1 = document.getElementById('MAIN_COLOR_1').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#MAIN_COLOR_1', settings.THEME.MAIN_COLOR_1, '--main-color1');
});

document.body.querySelector('#MAIN_COLOR_2').addEventListener('input', () => {
    const x = document.getElementById('MAIN_COLOR_2').value;
    root.style.setProperty('--main-color2-temp', x);
});

document.body.querySelector('#MAIN_COLOR_2').addEventListener('change', () => {
    settings.THEME.MAIN_COLOR_2 = document.getElementById('MAIN_COLOR_2').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#MAIN_COLOR_2', settings.THEME.MAIN_COLOR_2, '--main-color2');
});

document.body.querySelector('#MAIN_COLOR_3').addEventListener('input', () => {
    const x = document.getElementById('MAIN_COLOR_3').value;
    root.style.setProperty('--main-color3-temp', x);
});

document.body.querySelector('#MAIN_COLOR_3').addEventListener('change', () => {
    settings.THEME.MAIN_COLOR_3 = document.getElementById('MAIN_COLOR_3').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#MAIN_COLOR_3', settings.THEME.MAIN_COLOR_3, '--main-color3');
});

document.body.querySelector('#MAIN_COLOR_4').addEventListener('input', () => {
    const x = document.getElementById('MAIN_COLOR_4').value;
    root.style.setProperty('--main-color4-temp', x);
});

document.body.querySelector('#MAIN_COLOR_4').addEventListener('change', () => {
    settings.THEME.MAIN_COLOR_4 = document.getElementById('MAIN_COLOR_4').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#MAIN_COLOR_4', settings.THEME.MAIN_COLOR_4, '--main-color4');
});

document.body.querySelector('#TOP_BAR').addEventListener('input', () => {
    const x = document.getElementById('TOP_BAR').value;
    root.style.setProperty('--top-bar-temp', x);
});

document.body.querySelector('#TOP_BAR').addEventListener('change', () => {
    settings.THEME.TOP_BAR = document.getElementById('TOP_BAR').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#TOP_BAR', settings.THEME.TOP_BAR, '--top-bar');
});

document.body.querySelector('#MID_SECTION').addEventListener('input', () => {
    const x = document.getElementById('MID_SECTION').value;
    root.style.setProperty('--mid-section-temp', x);
});

document.body.querySelector('#MID_SECTION').addEventListener('change', () => {
    settings.THEME.MID_SECTION = document.getElementById('MID_SECTION').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#MID_SECTION', settings.THEME.MID_SECTION, '--mid-section');
});

document.body.querySelector('#CHAT_BUBBLE_BG').addEventListener('input', () => {
    const x = document.getElementById('CHAT_BUBBLE_BG').value;
    root.style.setProperty('--chat-bubble-temp', x);
});

document.body.querySelector('#CHAT_BUBBLE_BG').addEventListener('change', () => {
    settings.THEME.CHAT_BUBBLE_BG = document.getElementById('CHAT_BUBBLE_BG').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#CHAT_BUBBLE_BG', settings.THEME.CHAT_BUBBLE_BG, '--chat-bubble');
});

document.body.querySelector('#CHAT_BUBBLE_HEADER').addEventListener('input', () => {
    const x = document.getElementById('CHAT_BUBBLE_HEADER').value;
    root.style.setProperty('--chat-bubble-header-temp', x);
});

document.body.querySelector('#CHAT_BUBBLE_HEADER').addEventListener('change', () => {
    settings.THEME.CHAT_BUBBLE_HEADER = document.getElementById('CHAT_BUBBLE_HEADER').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#CHAT_BUBBLE_HEADER', settings.THEME.CHAT_BUBBLE_HEADER, '--chat-bubble-header');
});

document.body.querySelector('#CHAT_BUBBLE_MESSAGE').addEventListener('input', () => {
    const x = document.getElementById('CHAT_BUBBLE_MESSAGE').value;
    root.style.setProperty('--chat-bubble-message-temp', x);
});

document.body.querySelector('#CHAT_BUBBLE_MESSAGE').addEventListener('change', () => {
    settings.THEME.CHAT_BUBBLE_MESSAGE = document.getElementById('CHAT_BUBBLE_MESSAGE').value;
    fs.writeFileSync(settingsPath, ini.stringify(settings));
    changeColor('#CHAT_BUBBLE_MESSAGE', settings.THEME.CHAT_BUBBLE_MESSAGE, '--chat-bubble-message');
});

module.exports = { setTheme };
