import {pool} from '../config/database.js';

export function postMeasurement(req, res, next) {
  var temp = req.body.temperature;
  res.send(`The temperature is: ${temp}`);
}

export function getLatestMeasurement(req, res) {
  res.send('The most recent temperature reading was');
}