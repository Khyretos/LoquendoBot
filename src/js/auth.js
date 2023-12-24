const twitchAuthentication = () =>
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

                resolve(token['#access_token']);
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
    			</form>
    	    </body>
    	  </html>
    	  <script>
    	  function onSubmitComplete() {
    		  		  close();
    		}
            document.querySelector("#auth").style.display="none";
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

function getTwitchOauthToken() {
    return twitchAuthentication().then((res) => {
        return res;
    });
}

module.exports = { getTwitchOauthToken };
