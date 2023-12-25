const twitchTemplate = `
	<div class="icon-container">
		<img class="user-img" src="" />
		<img class="status-circle" src="./images/twitch-icon.png" />
	</div>
	<span class="username"></span>
	<div class="msg-box">
	</div>
`.trim();

const userTemplate = `
	<div class="icon-container-user">
		<span class="post-time-user">You</span>
		<img class="status-circle-user" src="./images/twitch-icon.png" />
		<img class="user-img-user" src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />
	</div>
	<span class="username-user">You</span>
	<div class="msg-box-user">
	</div>
`.trim();

const messageTemplate = `
<article class="msg-container msg-self" id="msg-0">
		<div class="icon-container-user">
				<img class="user-img-user"  src="https://gravatar.com/avatar/56234674574535734573000000000001?d=retro" />
				<img class="status-circle-user"  src="./images/twitch-icon.png" />
		</div>
		<div class="msg-box-user msg-box-user-temp">
				<div class="flr">
						<div class="messages-user">
								<span class="timestamp timestamp-temp"><span class="username username-temp">You</span><span class="posttime">${getPostTime()}</span></span>
								<br>
								<p class="msg msg-temp" id="msg-0">
										hello there 
								</p>
						</div>
				</div>
		</div>
</article>
`.trim();

module.exports = { twitchTemplate, userTemplate, messageTemplate };
