import express from 'express';
import * as controller from '../controllers/measurementsControllers.js'

export const measurementsRouter = express.Router();

measurementsRouter.post('/', controller.postMeasurement);
measurementsRouter.get('/latest', controller.getLatestMeasurement);
