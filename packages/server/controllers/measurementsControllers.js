import sensor from 'node-dht-sensor';
import {pool} from '../config/database.js';

export async function postMeasurement(req, res, next) {
  let temperature = null;
  let humidity = null;

  async function getTempReading() {
    try {
      const res = await sensor.read(22, 4);
      const temperature = (res.temperature * 9/5 + 32);
      const humidity = res.humidity;
      return {
        temperature, humidity
      }
    } catch (err) {
      console.error("Failed to read sensor data:", err);
    }
  }
  
  const {sensor_id = 1, temperature: reqTemp, humidity: reqHum} = req.body;
  if (reqTemp && reqHum) {
    temperature = reqTemp;
    humidity = reqHum;
  } else {
    const {temperature : sensorTemp, humidity: sensorHum} = await getTempReading();
    temperature = sensorTemp;
    humidity = sensorHum;
  }
  
  // grab the data off the request
  // validate the data
  const isDataValid = (
    Number.isInteger(sensor_id) &&
    typeof temperature == 'number' &&
    typeof humidity == 'number'
  );

  if (isDataValid) {
    // TODO - don't insert like this directly with SQL we need to use  We wouldn't want to pass the user generated data directly into our query due to security concerns
    const insertSQL = `INSERT INTO measurements (sensor_id, temperature, humidity) VALUES ($1, $2, $3);`;
    const values = [sensor_id, Number(temperature.toFixed(2)), Number(humidity.toFixed(2))];
    pool.query(insertSQL, values, (error, result) => {
      if (error) {
          res.status(400).send(error);
      } else {
          res.status(200).send('Saved to database.\n');
      }
    });
  } else {
    res.status(400).send('Please check that your data types are correct');
  };
};

export function getLatestMeasurement(req, res) {
  // Get most recent measurement from db and return as JSON.
  pool.query('SELECT * FROM measurements ORDER BY created DESC LIMIT 1;', (error, results) => {
    if (error) {
        throw error;
    }
    const temperatureHumidity = results.rows[0];

    // The temperature seems to be off a little, gonna try manually adjusting this for now
    const adjustedTemp = temperatureHumidity.temperature;
    const adjustedResults = {
      ...temperatureHumidity,
      temperature: adjustedTemp
    };
    res.status(200).json(adjustedResults);
  });
};
