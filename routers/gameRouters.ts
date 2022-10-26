import express from 'express';
import { gameController } from "../routes"

export const gameRoutes = express.Router();

gameRoutes.get("/getCards", gameController.getCards_Shuffle)


