import {Fragment, useState, useEffect} from 'react';
import {DAY_KEY_TO_NAME, SAN_FRANCISCO_LAT, SAN_FRANCISCO_LON, GET_LATEST_TEMP_INTERVAL} from '../constants';
import './Weather.css';

export const Weather = ({hideIndoorTemp, hideDailyTemp}) => {
  const [insideMeasurement, updateInsideMeasurement] = useState({});
  const [outsideMeasurement, updateOutsideMeasurement] = useState({});
  const [outsideDailyRemovedCurrentDay, updateOutsideDailyRemovedCurrentDay] = useState([]);
  const [isLoaded, updateIsLoaded] = useState(false);
  const [isFirstRender, updateIsFirstRender] = useState(true);

  const fetchIndoorTemp = () => {
    fetch('http://localhost:3001/measurements/latest')
    .then(response => response.json())
    .then(data => {
      updateInsideMeasurement(data);
    }).catch(err => {
      updateOutsideMeasurement(err);
    });
  }

  const fetchOutdoorTemp = async () => {
    // fetch(`https://api.openweathermap.org/data/2.5/weather?id=${CURRENT_LOCATION_WEATHER_ID}&units=imperial&appid=${process.env.REACT_APP_OPEN_WEATHER_KEY}`)
    await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${SAN_FRANCISCO_LAT}&lon=${SAN_FRANCISCO_LON}&exclude=minutely&appid=${process.env.REACT_APP_OPEN_WEATHER_KEY}&units=imperial`)
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
  
  const getCurrentDate = () => {
    const d = new Date();
    const date = d.getDate();
    return date;
  }

  const getDayFromUtc = (utcDate) => {
    const d = new Date(utcDate * 1000);
    const day = DAY_KEY_TO_NAME[String(d.getDay() || 0)];
    return day;
  }

  const getDateFromUtc = (utcDate) => {
    const d = new Date(utcDate * 1000);
    const date = d.getDate();
    return date;
  }

  useEffect(async () => {
    if (isFirstRender) {
      updateIsFirstRender(false);
      fetchIndoorTemp();
      await fetchOutdoorTemp();

      updateIsLoaded(true);
    } else {
      setIndoorTempInterval();
      setOutdoorTempInterval();
    }
  }, [isFirstRender])

  useEffect(() => {
    if (isLoaded) {
      // updateOutsideDailyRemovedCurrentDay(outsideMeasurement?.daily?.filter(({dt}) => getDateFromUtc(dt) !== getCurrentDate()));
      updateOutsideDailyRemovedCurrentDay(outsideMeasurement?.daily)
    }
  }, [outsideMeasurement, isLoaded])
  console.log('----> ', outsideDailyRemovedCurrentDay);
  return (
    <div>
      {isLoaded && (
        <div>
          <div>
            <div className="Weather-spacer-right-20 Weather-spacer-bottom-40">
              <span className="Weather-spacer-right-20">{outsideMeasurement?.current?.temp?.toFixed(0)}°</span>
              <span className="Weather-current-temp">{outsideMeasurement?.current?.feels_like?.toFixed(0)}°</span>
              <span className="Weather-spacer-left-5">{outsideMeasurement?.current?.wind_speed?.toFixed(0)}mph</span>
            </div>
            {!hideIndoorTemp && <div className="Weather-flexcenter">
              <span className="Weather-spacer-right-5">In</span>
              <span>{insideMeasurement.temperature?.toFixed(0)}°</span>
            </div>}
            {!hideDailyTemp && <div>
              <ul className="Weather-daily-list">
                {outsideDailyRemovedCurrentDay?.map(({dt, temp, weather}, index) => (
                  <Fragment key={dt}>
                    <li className="Weather-daily-listItem">
                      <div className="Weather-flexcenter">{getDayFromUtc(dt)} <img className="Weather-background-image" src={`http://openweathermap.org/img/wn/${weather?.[0]?.icon}.png`} /></div>
                      <span className="Weather-spacer-right-5">{temp.min.toFixed(0)}</span>
                      <span>{temp.max.toFixed(0)}</span>
                    </li>
                    {index !== outsideDailyRemovedCurrentDay.length -1 && <span> | </span>}
                  </Fragment>
                ))}
              </ul>
            </div>}
          </div>
        </div>
      )}
    </div>
  );
};