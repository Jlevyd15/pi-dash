// import {useState, useEffect} from 'react';
import {Route, Switch} from 'react-router-dom';
// import {ROUTES} from '../constants';
// import {Spotify} from './Spotify';
import {Clock} from './Clock';
import {Weather} from './Weather';
// import {loadSpotifyPlayer} from '../utils'

import './Main.css';

export const Main = ({history, selectedTab}) => {
  // Spotify
  // const [spotifyData, updateSpotifyData] = useState();
  // const [spotifySDKReady, updateSpotifySDKReady] = useState(false);
  // const [spotifyRecentlyPlayed, updateSpotifyRecentlyPlayedData] = useState();
  // // TODO(@jlevyd15) implement this, so we can select a playback device from the view
  // const [spotifyDevices, updateSpotifyDevices] = useState();


  // useEffect(async () => {
  //   await loadSpotifyPlayer()
  //   window.onSpotifyWebPlaybackSDKReady = () => {
  //     updateSpotifySDKReady(true)
  //   }
  // }, []);

  // Google Calander call


  return (
    <div className="Main-container">
      <Switch>
        <Route exact path={["/", "/weather"]}>
          <Weather hideIndoorTemp />
        </Route>
        <Route path="/clock">
          <Clock />
          {/* {spotifySDKReady && (
            <Spotify 
              history={history}
              spotifyData={spotifyData}
              updateSpotifyData={updateSpotifyData}
              spotifyRecentlyPlayed={spotifyRecentlyPlayed}
              updateSpotifyRecentlyPlayedData={updateSpotifyRecentlyPlayedData}
              spotifyDevices={spotifyDevices}
              updateSpotifyDevices={updateSpotifyDevices}
            />
          )} */}
        </Route>
        <Route path="/both">
          <div>
            <Weather hideIndoorTemp hideDailyTemp />
            <Clock hideDate />
          </div>
        </Route>
      </Switch>
    </div>
  )
}
