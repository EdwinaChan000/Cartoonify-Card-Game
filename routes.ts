import express from "express";
import { knex } from "./server";

export const routes = express.Router();

import { ProfileService } from "./services/ProfileService";
import { ProfileController } from "./controllers/ProfileController";
const profileService = new ProfileService(knex);
export const profileController = new ProfileController(profileService);

import { NewCardService } from "./services/NewCardService";
import { NewCardController } from "./controllers/newCardController";
const newCardService = new NewCardService(knex);
export const newCardController = new NewCardController(newCardService);

import { UserController } from "./controllers/userController";
import { UserService } from "./services/UserService";
const userService = new UserService(knex);
export const userController = new UserController(userService);

import { GameService } from './services/GameService';
import { GameController } from './controllers/gameController';
const gameService = new GameService(knex);
export const gameController = new GameController(gameService)


import { userRoutes } from "./routers/userRouters";
routes.use("/user", userRoutes);

import { profileRoutes } from "./routers/profileRouters";
routes.use("/profile", profileRoutes);

import { logoutRouter } from "./routers/logoutRouter";
import { newCardRoutes } from "./routers/newCardRouters";

routes.use("/logout", logoutRouter);

routes.use("/newCard", newCardRoutes);

import { gameRoutes } from './routers/gameRouters';
routes.use("/game", gameRoutes)


// import { ioR } from `./routers/ioRouters`;
// import { IOController } from './controllers/ioController';
// export const ioController = new IOController(io)

// io.use(ioR)



// var app = express();
// app.io = require('socket.io')();

// var routes = require('./routes/index')(app.io);

// app.use('/', routes);