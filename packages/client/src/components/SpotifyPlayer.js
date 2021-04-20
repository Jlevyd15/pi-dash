import iconPlay from '../assets/multimedia/play-button.svg';
import iconPause from '../assets/multimedia/pause.svg';
import iconNext from '../assets/multimedia/next.svg';
import iconBack from '../assets/multimedia/back.svg';
import iconVolumeIncrease from '../assets/multimedia/volume-increase.svg';
import iconVolumeMute from '../assets/multimedia/volume-mute.svg';

import './SpotifyPlayer.css';

export const SpotifyPlayer = ({player = {}, recent = {}, setSpotifyPlayerStatus, setSpotifyTrack, showingRecentlyPlayed, toggleShowRecentlyPlayed}) => {
  const albumArtworkUrl = player?.item?.album?.images[1].url;

  const handlePlayPauseClick = () => {
    setSpotifyPlayerStatus(player.is_playing)
  }

  const handleSetSpotifyTrackPrevious = () => {
    setSpotifyTrack(true);
  }

  const handleSetSpotifyTrackNext = () => {
    setSpotifyTrack(false);
  }

  return (
    <div className="Spotifyplayer-container">
      {showingRecentlyPlayed ? 
        <div className="Spotifyplayer-recentplayed-container">
          <button className="Spotifyplayer-close-button" onClick={() => toggleShowRecentlyPlayed(false)}>X</button>
          {recent?.items && (
            <ul className="Spotifyplayer-recentplayed-list">
              {recent?.items.map(({played_at, track}) => <li key={played_at}><p><b>{track?.name}</b> - {track?.artists[0]?.name}</p></li>)}
            </ul>
          )}
        </div> 
      : <div className="Spotifyplayer-image-container">
          <button className="Spotifyplayer-image-button" onClick={() => toggleShowRecentlyPlayed(true)}>
            <img className="Spotifyplayer-song-image" src={albumArtworkUrl} />
          </button>
      </div>}
      
      <div className="Spotifyplayer-container-buttons">
        <div className="Spotifyplayer-songname-container">
          <p className="Spotifyplayer-song-name">{player?.item?.name}</p>
          <p className="Spotifyplayer-song-artist">{player?.item?.artists[0]?.name}</p>
        </div>
        <div>
          <button>😀</button>
        </div>
        <div className="Spotifyplayer-container-buttons-playback">
          <button className="Spotifyplayer-icon-button" onClick={handleSetSpotifyTrackPrevious}>
            <img className="Spotifyplayer-icon" src={iconBack} />
          </button>
          <button className="Spotifyplayer-icon-button" onClick={handlePlayPauseClick}>
            {player.is_playing ? <img className="Spotifyplayer-icon" src={iconPause} /> : <img className="Spotifyplayer-icon" src={iconPlay} />}
          </button>
          <button className="Spotifyplayer-icon-button" onClick={handleSetSpotifyTrackNext}>
            <img className="Spotifyplayer-icon" src={iconNext} />
          </button>
        </div>
        <div className="Spotifyplayer-container-buttons-volume">
          <img className="Spotifyplayer-icon--small" src={iconVolumeMute} />
          <label htmlFor="volume">
            <input id="volume" type="range" value={player?.device?.volume_percent} />
          </label>
          <img className="Spotifyplayer-icon--small" src={iconVolumeIncrease} />
        </div>
      </div>

      


    </div>
  );
}
