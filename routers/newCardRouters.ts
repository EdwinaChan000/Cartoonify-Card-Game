import express from "express";
import { newCardController } from "../routes";
import { signUpFormMiddleware } from "../userForm";

export const newCardRoutes = express.Router();
newCardRoutes.post("/draw", signUpFormMiddleware, newCardController.draw);

newCardRoutes.get("/draw", signUpFormMiddleware, newCardController.getNewCard);
