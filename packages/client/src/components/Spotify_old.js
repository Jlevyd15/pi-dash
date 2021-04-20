import {useEffect} from 'react';
import {parse} from 'query-string';
import {ROUTES, TOKEN_REFRESH_DELAY} from './constants';

import {SpotifyPlayer} from './SpotifyPlayer';

import './Spotify.css';

export const Spotify = ({
  className,
  history,
  accessTokenRefreshTimer,
  updateAccessTokenRefreshTimer,
  spotifyAuthToken,
  updateSpotifyAuthToken,
  spotifyData,
  updateSpotifyData,
  accessTokenNeedsRefresh,
  updateAccessTokenNeedsRefresh,
}) => {
  // This effect should keep the session data in sync with the state object session tokens
  useEffect(() => {
    getSessionDataTokens();

    if (!spotifyData && spotifyAuthToken) {
      getSpotifyAccountDetails();
    }
  }, [])

  useEffect(() => {
    const access_token = parse(window.location.search)?.access_token || spotifyAuthToken?.access_token;
    console.log('spotifyAuthToken', spotifyAuthToken, access_token)
    if (access_token) {
      const jsonTokenData = parse(window.location.search);
      updateSpotifyAuthToken(jsonTokenData);
      localStorage.setItem('spotify', JSON.stringify(jsonTokenData));
      // once we get the first access token, we don't need to refresh.
      updateAccessTokenNeedsRefresh(false);
      // set a timer that expires in 50 minutes
      setAccessTokenRefreshTimer();
      // clear the params off the url once they're saved
      history.push(ROUTES.MUSIC);
      // now that we have a token, make the call to get the Spotify data
      getSpotifyAccountDetails(access_token);
    }
  }, []);

  // This effect waits for the accessTokenNeedsRefresh flag to change
  useEffect(() => {
    if (accessTokenNeedsRefresh) {
      const refresh_token = spotifyAuthToken?.refresh_token;
      // TODO(@jlevyd15) This call is being made twice, it doen't break things but isn't necessary
      getSpotifyAccessToken(refresh_token);
    }
  }, [accessTokenNeedsRefresh]);

  const getSessionDataTokens = () => {
    const sessionDataTokens = localStorage.getItem('spotify');
    if (sessionDataTokens) {
      updateSpotifyAuthToken(JSON.parse(sessionDataTokens));
      return JSON.parse(sessionDataTokens);
    }
    return undefined;
  }

  // This function sets a timer for TOKEN_REFRESH_DELAY, when it expires, 
  // set the flag to make the call to get a refresh token
  const setAccessTokenRefreshTimer = () => {
    updateAccessTokenRefreshTimer(setTimeout(() => {
      updateAccessTokenNeedsRefresh(true);
    }, TOKEN_REFRESH_DELAY));
  }

  const getSpotifyAccessToken = (refresh_token) => {
    console.log('calling getSpotifyAccessToken', refresh_token);
    if (!refresh_token) {
      return undefined;
    }
    fetch('http://localhost:3001/spotify/refresh', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({refresh_token})
    })
    .then(response => response.json())
    .then(data => {
      // save the new access and refresh tokens
      updateSpotifyAuthToken(parse(data));
      localStorage.setItem('spotify', data);
      // reset the timer flag 
      updateAccessTokenNeedsRefresh(false);
      // clear the old timer
      clearTimeout(accessTokenRefreshTimer);
      // start a new timer
      setAccessTokenRefreshTimer()
    })
    .catch((error) => {
      console.error('Error requesting new auth_token:', error);
    });
  }

  const getSpotifyAccountDetails = (access_token) => {
    fetch('https://api.spotify.com/v1/me/player', {
      headers: { 'Authorization': 'Bearer ' + access_token }})
      .then(response => response.json())
      .then(data => {
        updateSpotifyData(data);
      })
      .catch((error) => {
        console.error('Error getting player data:', error);
      });
    console.log('calling the Spotify API');
  }
  console.log('we have the token!', spotifyAuthToken?.refresh_token)

  return (
    <>
      <div>
        {!spotifyAuthToken?.access_token && (
          <a 
          className="Spotify-login-btn" 
          href='http://localhost:3001/spotify/login'
          >
            Login with Spotify
          </a>
        )}
      </div>

      <SpotifyPlayer spotifyData={spotifyData} />
    </>
  )
}