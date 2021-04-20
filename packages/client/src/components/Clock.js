import {useState, useEffect} from 'react';
import {DAY_KEY_TO_NAME, MONTH_KEY_TO_NAME, CURRENT_DATE_DELAY, CURRENT_TIME_DELAY} from '../constants';
import {getDateSuffix} from '../helpers';
import './Clock.css';

export const Clock = ({hideDate}) => {
  const [isFirstRender, updateIsFirstRender] = useState(true);
  const [currentTime, updateCurrentTime] = useState({});
  const [currentDate, updateCurrentDate] = useState({});

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

    updateCurrentDate({day, month, date});
  }

  const setCurrentDateInterval = () => {
    setInterval(() => {
      getCurrentDate();
    }, CURRENT_DATE_DELAY);
  };

  useEffect(() => {
    if (isFirstRender) {
      updateIsFirstRender(false);
      getCurrentDate();
      getCurrentDate();
    } else {
      setCurrentTimeInterval();
      setCurrentDateInterval();
    }
  }, [isFirstRender])


  const {hours = '', minutes= '', timeSuffix = ''} = currentTime;
  const {day, month, date} = currentDate;
  return (
    <div className="Clock-main-container">
        <div>
          {!hideDate && <div className="Clock-date">
            {`${day} ${month} ${date}${getDateSuffix(date)}`}
          </div>}
          {hours && minutes && (
            <div>
              {`${hours}:${minutes} ${timeSuffix}`}
            </div>
          )}
        </div>
    </div>
  )
}