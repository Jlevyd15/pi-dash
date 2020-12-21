import express from 'express';
import dotenv from 'dotenv';
import {pool} from './config/database.js';
import {homeRouter} from './routes/homeRoutes.js';
import {measurementsRouter} from './routes/measurementRoutes.js';

dotenv.config({ path: import.meta.url + '/.env' })
const app = express()
const port = 3000

app.use(express.json());

app.use('/', homeRouter);
app.use('/measurements', measurementsRouter);


app.listen(port, () => {
  console.log(`Welcome to Pi Dash is up and running at http://localhost:${port}`)
});