import express from "express";
import { profileController } from "../routes";

export const profileRoutes = express.Router();

profileRoutes.get("/info", profileController.getPersonalInfo);
profileRoutes.get("/card", profileController.getPersonalCard);
