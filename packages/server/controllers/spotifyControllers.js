import https from 'https';
import {stringify} from 'querystring';
import * as pkce from 'pkce-challenge';


const stateKey = 'spotify_auth_state';

export function getSpotifyLogin(req, res) {
  console.log(pkce);
  // const codeVerifier = randomBytes(43);
  // const hashedCodeVerifier = createHash('sha256').update(codeVerifier).digest('base64');
  const pkceChallengeAndVerifier = pkce.default();
  const code_challenge = pkceChallengeAndVerifier.code_challenge;
  const client_id = process.env['SPOTIFY_CLIENT_ID'];
  const scope = 'user-read-currently-playing user-read-playback-state user-modify-playback-state user-read-recently-played streaming user-read-email user-read-private';
  const redirect_uri = 'http://localhost:3001/spotify/callback';
  const code_challenge_method='S256';
  // const code_challenge = hashedCodeVerifier;
  console.log('in login... ', code_challenge)
  // save the code verifier in a cookie so we can access later in the callback request
  res.cookie(stateKey, pkceChallengeAndVerifier.code_verifier);
  console.log('redirecting...');
  res.redirect('https://accounts.spotify.com/authorize?' +
    stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      code_challenge_method,
      code_challenge,
    }));
};

export function getSpotifyCallback(req, res) {
  const client_id = process.env['SPOTIFY_CLIENT_ID'];
  const grant_type = 'authorization_code';
  const code = req.query.code;
  const error = req.query.error;
  const redirect_uri = 'http://localhost:3001/spotify/callback';
  const code_verifier = req.cookies ? req.cookies[stateKey] : null;

  console.log('in the cllback... ', code_verifier);
  console.log('code... ', code);

  // TODO - Not using this for now but it's recommended to check it here for security reasons
  // const state = req.query.state;

  if (error) {
    res.status(400).send('There was an error processing that request, try again.')
  }

  res.clearCookie(stateKey);

  const postSpotifyTokenBody = stringify({
    client_id,
    grant_type,
    code,
    redirect_uri,
    code_verifier,
  });
  
  const authOptions = {
    hostname: "accounts.spotify.com",
    path: "/api/token",
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postSpotifyTokenBody)
    },
  };

    // Exchange the code for an auth token
  const postReq = https.request(authOptions, (httpsRes) => {
    let data = ""
    
    httpsRes.on("data", d => {
      data += d
    })
    httpsRes.on("end", () => {
      console.log('getting auth token... ');
      const authAndRefreshTokens = JSON.parse(data);
      res.redirect('http://localhost:3000/music?' + stringify(authAndRefreshTokens));
    })
  });
  postReq.on("error", console.error);
  postReq.write(postSpotifyTokenBody);
  postReq.end();
};

export function getSpotifyRefresh(req, res) {
  const client_id = process.env['SPOTIFY_CLIENT_ID'];
  const client_secret = process.env['SPOTIFY_CLIENT_SECRET'];
  const refresh_token = req.body.refresh_token;
  const postSpotifyTokenBody = stringify({
    grant_type: 'refresh_token',
    refresh_token,
  });
  const authOptions = {
    hostname: "accounts.spotify.com",
    path: "/api/token",
    method: "POST",
    headers: {
      "Authorization": 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')),
      "content-type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postSpotifyTokenBody)
    },
  };
  const postReq = https.request(authOptions, (httpsRes) => {
    let data = ""
    
    httpsRes.on("data", d => {
      data += d
    })
    httpsRes.on("end", () => {
      console.log('getting refreshed auth token... ', data);
      res.json(data);
    });
  });
  postReq.on("error", console.error);
  postReq.write(postSpotifyTokenBody);
  postReq.end();
};