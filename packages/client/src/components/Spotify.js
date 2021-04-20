import {useEffect, useState} from 'react';
import {parse} from 'query-string';
import {POLL_PLAYER_DATA, ROUTES, TOKEN_REFRESH_DELAY} from '../constants';

import {SpotifyPlayer} from './SpotifyPlayer';

import './Spotify.css';

export const Spotify = ({
  className,
  history,
  spotifyData,
  updateSpotifyData,
  spotifyRecentlyPlayed,
  updateSpotifyRecentlyPlayedData
}) => {
  const [showingRecentlyPlayed, toggleShowRecentlyPlayed] = useState(false);

  useEffect(async () => {
    // when the url has auth token params, save them into local storage
    const search = parse(history.location.search);
    const tokenData = getSessionDataTokens();
    if (search.access_token) {
      localStorage.setItem('spotify', JSON.stringify(search));
      history.push(ROUTES.MUSIC);

      getAllSpotifyData(search.access_token);
      setPollForRefreshToken();

      if (!window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady = initializePlayer;
      } else {
        initializePlayer(search.access_token);
      }

    } else if (tokenData) {
      // already stored token data, use the refresh token to get a new access token
      await getSpotifyAccessToken(tokenData.refresh_token);
      const newTokenData = getSessionDataTokens();
      if (newTokenData && !newTokenData.error) {
        localStorage.setItem('spotify', JSON.stringify(newTokenData));
      } else {
        console.log('error in interval call', newTokenData.error);
      }
      getAllSpotifyData(newTokenData.access_token);
      if (!window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady = initializePlayer;
      } else {
        initializePlayer(newTokenData.access_token);
      }
      setPollForRefreshToken();
    }

  }, []);

  const initializePlayer = (token) => {
      // this.updateState({ isInitializing: true });
  
      const player = new window.Spotify.Player({
        getOAuthToken: (cb) => {
          cb(token);
        },
        name: 'PiDash',
        volume: 1,
      });
  
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });
      // player.addListener('player_state_changed', this.handlePlayerStateChanges);
      player.addListener('player_state_changed', state => { console.log(state); });
      // player.addListener('initialization_error', (error) =>
      //   this.handlePlayerErrors('initialization_error', error.message),
      // );
      player.addListener('authentication_error', (error) =>
        // this.handlePlayerErrors('authentication_error', error.message),
        console.log('Auth error', error),
      );
      player.addListener('account_error', (error) =>
        console.log('account error', error),
      );
      player.addListener('playback_error', (error) =>
        console.log('playback_error', error),
      );
  
      player.connect();
  };

  const getAllSpotifyData = (access_token) => {
    getSpotifyPlayerDetails(access_token);
    getSpotifyRecentPlayed(access_token);
  }

  const setPollForRefreshToken = () => {
    setInterval(async () => {
      const tokenData = getSessionDataTokens();
        if (tokenData) {
          const refresh_token = tokenData?.refresh_token;
          await getSpotifyAccessToken(refresh_token);
          const newTokenData = getSessionDataTokens();
          if (newTokenData && !newTokenData.error) {
            localStorage.setItem('spotify', JSON.stringify(newTokenData));
          } else {
            console.log('error in interval call', newTokenData.error);
          }
          console.log('call spotify');
        }
    }, TOKEN_REFRESH_DELAY);
  }

  const getSessionDataTokens = () => {
    const sessionDataTokens = localStorage.getItem('spotify');
    if (sessionDataTokens) {
      return JSON.parse(sessionDataTokens);
    }
    return undefined;
  }

  // requests a new access_token from Spotify using the refresh_token
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
      if (data && !data.error) {
        // save the new access and refresh tokens
        localStorage.setItem('spotify', data);
      }
    })
    .catch((error) => {
      console.error('Error requesting new auth_token:', error);
    });
  }

  const getSpotifyPlayerDetails = async (access_token) => {
    fetch('https://api.spotify.com/v1/me/player', {
      headers: { 'Authorization': 'Bearer ' + access_token }})
      .then(response => response.json())
      .then(data => {
        updateSpotifyData(data);
      })
      .catch(async (error) => {
        console.error('Error getting player data:', error);
      });
    console.log('calling the Spotify player');
  }

  const getSpotifyRecentPlayed = async (access_token) => {
    fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: { 'Authorization': 'Bearer ' + access_token }})
      .then(response => response.json())
      .then(data => {
        updateSpotifyRecentlyPlayedData(data);
      })
      .catch(async (error) => {
        console.error('Error getting recent played data:', error);
      });
    console.log('calling the Spotify recent played data');
  }

  const setSpotifyPlayerStatus = (isPlaying) => {
    const access_token = getSessionDataTokens()?.access_token;
    if (isPlaying) {
      // if a song is playing pause it
      fetch(`https://api.spotify.com/v1/me/player/pause?device_id=11b9aee24d6c3e3e29b3613cc92f92155e13ccf5`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + access_token }})
        .then(() => {
          // once we set the player to a new state refetch the player details to sync the view
          getSpotifyPlayerDetails(access_token);
        })
        .catch(async (error) => {
          console.error('Error setting player status - pause:', error);
        })
    } else {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=11b9aee24d6c3e3e29b3613cc92f92155e13ccf5`, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + access_token }})
        .then(() => {
          // once we set the player to a new state refetch the player details to sync the view
          getSpotifyPlayerDetails(access_token);
        })
        .catch(async (error) => {
          console.error('Error setting player status - start/resume:', error);
        });
    }
  }

  const setSpotifyTrack = (setToPreviousTrack) => {
    const access_token = getSessionDataTokens()?.access_token;
    if (setToPreviousTrack) {
      fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + access_token }})
        .then(() => {
          // once we set the player to a new state refetch the player details to sync the view
          getSpotifyPlayerDetails(access_token);
        })
        .catch(async (error) => {
          console.error('Error setting player status - pause:', error);
        });
    } else {
      fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + access_token }})
        .then(() => {
          // once we set the player to a new state refetch the player details to sync the view
          getSpotifyPlayerDetails(access_token);
        })
        .catch(async (error) => {
          console.error('Error setting player status - start/resume:', error);
        });
    }
  }

  return (
    <>
      <div>
        {!getSessionDataTokens()?.access_token ? (
          <a 
          className="Spotify-login-btn" 
          href='http://localhost:3001/spotify/login'
          >
            Login with Spotify
          </a>
        ) : (
          <SpotifyPlayer 
            player={spotifyData}
            recent={spotifyRecentlyPlayed}
            setSpotifyPlayerStatus={setSpotifyPlayerStatus} 
            setSpotifyTrack={setSpotifyTrack}
            showingRecentlyPlayed={showingRecentlyPlayed}
            toggleShowRecentlyPlayed={toggleShowRecentlyPlayed}
          />
        )}
      </div>
    </>
  )
}