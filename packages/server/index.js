import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {homeRouter} from './routes/homeRoutes.js';
import {measurementsRouter} from './routes/measurementRoutes.js';
import {spotifyRouter} from './routes/spotifyRoutes.js';

config();

const app = express();
const port = 3001;

app.use(express.json());
// Set public to publicly accessible
app.use(express.static('public'));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });
app.use(express.urlencoded({
  extended: true
}))
app.use(cors())
app.use(cookieParser());
app.use('/', homeRouter);
app.use('/measurements', measurementsRouter);
app.use('/spotify', spotifyRouter);

app.listen(port, () => {
  console.log(`Welcome to Pi Dash is up and running at http://localhost:${port}`);
});