import express from "express";
import { signUpFormMiddleware } from "../userForm";
import { userController } from "../routes";

export const userRoutes = express.Router();
userRoutes.post("/login", userController.login);
userRoutes.post("/signUp", signUpFormMiddleware, userController.signUp);
