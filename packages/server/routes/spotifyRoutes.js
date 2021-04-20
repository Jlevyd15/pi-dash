import express from 'express';
import cors from 'cors';
import {getSpotifyCallback, getSpotifyLogin, getSpotifyRefresh} from '../controllers/spotifyControllers.js'

export const spotifyRouter = express.Router();

spotifyRouter.get('/login', cors(), getSpotifyLogin);
spotifyRouter.get('/callback', getSpotifyCallback);
spotifyRouter.post('/refresh', getSpotifyRefresh);