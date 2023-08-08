console.log("kees");
// const clientId = 'YOUR_TWITCH_CLIENT_ID';
// const redirectUri = 'http://localhost:1989/auth';
// const scopes = ['chat:edit', 'chat:read'];

// const express = require('express');
// const tempAuthServer = express();
// const port = 1989;

// const { parse: parseQueryString } = require('querystring');

// tempAuthServer.use(function (req, res, next) {
//     if (req.url !== "/auth") {
//         let token = parseQueryString(req.query.auth)
//         res.json(token["#access_token"]);
//         // settings.TWITCH.OAUTH_TOKEN = token["#access_token"];
//         // fs.writeFileSync(settingsPath, ini.stringify(settings));
//         // settings = ini.parse(fs.readFileSync(settingsPath, 'utf-8'));
//         // tempAuthServer.close();
//     }
//     next();
// });

// const htmlString = `
// 	  <!DOCTYPE html>
// 	  <html>
// 	    <head>
// 	      <title>Authentication</title>
// 	    </head>
// 	    <body>
// 	      <h1>Authentication successful! You can close this window now.</h1>
// 			  <form name="auth" "action="auth" method="get" >
// 			    <input type="text" id="auth" name="auth"/>
// 			    <input type="submit" />
// 			</form>
// 	    </body>
// 	  </html>
// 	  <script>
// 	  function onSubmitComplete() {
// 		  		  close();
// 		}
// 		  document.querySelector("#auth").value = document.location.hash;
// 		  document.auth.submit();
// 		  setTimeout(onSubmitComplete, 500);
// 	  </script>`;

// tempAuthServer.get('/auth', (req, res) => {
//     // res.send(htmlString);
// });

// tempAuthServer.post('/auth', (req, res) => {
//     res.render('authentication', { name: req.body.name });
// });

// tempAuthServer.listen(port, () => { });

// const authURL = `https://id.twitch.tv/oauth2/authorize?client_id=${settings.TWITCH.CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scopes.join(' ')}`;
// shell.openExternal(authURL);
onsole.log('ExecPath', process.execPath);

process.on('message', (m) => {
    console.log('Got message:', m);

    process.send("message", "lol");
});