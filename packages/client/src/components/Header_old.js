import {useState, useEffect} from 'react';
import {CURRENT_LOCATION_WEATHER_ID, DAY_KEY_TO_NAME, MONTH_KEY_TO_NAME, CURRENT_DATE_DELAY, CURRENT_TIME_DELAY, GET_LATEST_TEMP_INTERVAL} from '../constants';
import {getDateSuffix} from '../helpers';
import './Header.css';

export const Header = ({className}) => {
  const [insideMeasurement, updateInsideMeasurement] = useState({});
  const [outsideMeasurement, updateOutsideMeasurement] = useState({});
  const [currentTime, updateCurrentTime] = useState({});
  const [currentDate, updateCurrentDate] = useState({});
  const [isFirstRender, updateIsFirstRender] = useState(true);
  const [isLoaded, updateIsLoaded] = useState(false);

  const getCurrentTime = () => {
    const d = new Date();
    const hours = String(d.getHours());
    const isPm = hours >= 12;
    const twelveHourFormattedHours = hours > 12 ? hours - 12 : hours;
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    updateCurrentTime({hours: twelveHourFormattedHours, minutes, seconds, timeSuffix: isPm ? 'PM' : 'AM'});
  };
  

  const setCurrentTimeInterval = () => {
    setInterval(() => {
      getCurrentTime();
    }, CURRENT_TIME_DELAY);
  };

  const getCurrentDate = () => {
    const d = new Date();
    const day = DAY_KEY_TO_NAME[String(d.getDay() || 0)]; 
    const month = MONTH_KEY_TO_NAME[String(d.getMonth() || 0)];
    const date = d.getDate();
    console.log(d.getDay(), day);
    updateCurrentDate({day, month, date});
  }

  const setCurrentDateInterval = () => {
    setInterval(() => {
      getCurrentDate();
    }, CURRENT_DATE_DELAY);
  };

  const fetchIndoorTemp = () => {
    fetch('http://localhost:3001/measurements/latest')
    .then(response => response.json())
    .then(data => {
      updateInsideMeasurement(data);
    }).catch(err => {
      updateOutsideMeasurement(err);
    });
  }

  const fetchOutdoorTemp = () => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?id=${CURRENT_LOCATION_WEATHER_ID}&units=imperial&appid=${process.env.REACT_APP_OPEN_WEATHER_KEY}`)
    .then(response => response.json())
    .then(data => {
      updateOutsideMeasurement(data);
    }).catch(err => {
      updateOutsideMeasurement(err);
    });
  }

  const setIndoorTempInterval = () => {
    setInterval(() => {
      fetchIndoorTemp();
    }, GET_LATEST_TEMP_INTERVAL);
  };

  const setOutdoorTempInterval = () => {
    setInterval(() => {
      fetchOutdoorTemp();
    }, GET_LATEST_TEMP_INTERVAL);
  };

  useEffect(() => {
    if (isFirstRender) {
      updateIsFirstRender(false);
      fetchIndoorTemp();
      fetchOutdoorTemp();
      getCurrentDate();
      getCurrentDate();

      updateIsLoaded(true);
    } else {
      setCurrentTimeInterval();
      setCurrentDateInterval();
      setIndoorTempInterval();
      setOutdoorTempInterval();
    }
  }, [isFirstRender])

  const {hours = '', minutes = '', timeSuffix = ''} = currentTime;
  const {day, month, date} = currentDate;
  return (
    <header className={`Header-container ${className}`}>
      {isLoaded && (
        <>
          <div className="Header-inner">
            <div className="Header-spacer-right-20">
              <img src={`http://openweathermap.org/img/wn/${outsideMeasurement?.weather?.[0]?.icon}.png`} />
            </div>
            <div className="Header-spacer-right-20 Header-flexcenter">
              <span className="Header-spacer-right-5">Out</span>
              <span>{outsideMeasurement?.main?.temp?.toFixed(0)}°</span>
            </div>
            <div className="Header-flexcenter">
              <span className="Header-spacer-right-5">In</span>
              <span>{insideMeasurement.temperature?.toFixed(0)}°</span>
            </div>
          </div>
          <div className="Header-flexcenter">
            <span className="Header-spacer-right-5">
              {`${day} ${month} ${date}${getDateSuffix(date)}`}
            </span>
            <span>
              {`${hours}:${minutes} ${timeSuffix}`}
            </span>
          </div>
        </>
      )}
    </header>
  )
}