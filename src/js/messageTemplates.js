const twitchTemplate = `
	<img class="user-img" src="" />
	<img class="status-circle sender" src="./images/twitch-icon.png" />
	<span class="post-time sender"></span>
	<span class="username sender"></span>
	<div class="msg-box sender"></div>
`.trim();

const userTemplate = `
	<img class="user-img" src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />		
	<img class="status-circle user" src="./images/twitch-icon.png" />
	<span class="post-time user"></span>
	<span class="username user">You</span>
	<div class="msg-box user"></div>
`.trim();

const messageTemplate = `
<article class="msg-container user" id="msg-0">
	<img class="user-img" src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />		
	<img class="status-circle user" src="./images/twitch-icon.png" />
	<span class="post-time user"> 12:00 PM</span>
	<span class="username user">You</span>
	<div class="msg-box user">Hello there</div>
</article>
`.trim();

module.exports = { twitchTemplate, userTemplate, messageTemplate };
