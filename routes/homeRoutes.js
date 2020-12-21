import express from 'express';
import {getHome} from '../controllers/homeControllers.js'

export const homeRouter = express.Router();

homeRouter.get('/', getHome);
