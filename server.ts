import express from "express";
import expressSession from "express-session";
import http from "http";
import { Server as SocketIO } from "socket.io";
import path from "path";
import Knex from "knex";
import dotenv from "dotenv";
import { isLoggedInAPI } from "./utils/guards";
import { networkInterfaces } from "os";

dotenv.config();

export const app = express();
export const server = new http.Server(app);
export const io = new SocketIO(server);

const knexConfigs = require("./knexfile");
const configMode = process.env.NODE_ENV || "development";
const knexConfig = knexConfigs[configMode];
export const knex = Knex(knexConfig);

export const sessionMiddleware = expressSession({
  secret: "project is funny",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

app.use(express.json());
app.use(sessionMiddleware);

import { routes } from "./routes";
app.use(routes);




/* --------------- */
/* == SOCKET.IO == */
/* --------------- */

import { gameController } from "./routes";

io.use((socket, next) => {
  let req = socket.request as express.Request;
  let res = req.res as express.Response;
  sessionMiddleware(req, res, next as express.NextFunction);
});

// // *****************************************************************
// // Attempt to split Socket.io Controller
// import { ioController } from "./routes"
// import { IOController } from "./controllers/ioController"

// const ioController = new IOController(io)

// io.use(ioController.IO)
// // *****************************************************************

// Global variable to store information for each room
// Description: rooms{room id{host_id,guest_id,gameStats{...},
//              host_card,hostCardHTML,guest_card,guestCardHTML}}

// DECLARE GLOBAL VARIABLES //

export let rooms = {}

io.on("connection", function (socket) {
  console.log(`\nSocket ID:`, socket.id, "[Connected]");
  console.table(socket.request["session"].user);

  // DECLARE VARIABLES //

  // User info from session
  let user = socket.request["session"].user

  // Client say hello to server
  socket.on("hello", (data: any) => {
    console.log("\n" + data["msg"]);
  });

  // Client request to create room (joinRoom Page)
  // Assign room to Host
  socket.on("createRoom", (new_room_id: any) => {
    console.log("\n", "New Room ID = ", new_room_id);
    socket.emit("assignRoom", new_room_id, { type: "host" });
  });

  // Guest join a room
  socket.on("joinRoom", async (room_id: any) => {
    socket.join(room_id);
    console.table(socket.request["session"].user);

    // User Session Info
    if (!rooms[room_id]) {
      rooms[room_id] = {}
      rooms[room_id].gameStats = {};
    }

    let room = rooms[room_id]
    let user = socket.request["session"].user

    // Return all sockets from room
    let player_count = (async function () {
      const roomSocketArray = await io.in(room_id).fetchSockets();
      let count = 0;
      console.log(`\n[${roomSocketArray.length}] Player(s) in "${room_id}"`);
      for (let id of roomSocketArray) {
        count++;
        console.log(`[${count}]Player: socket.id = ${id["id"]}`);
      }
      return count

    })();

    if (await player_count === 1) {
      room.host_id = user.id
      room["gameStats"].host_id = user.id;
      socket.request["session"].room = { id: room_id, player_type: "host" }
      socket.request["session"].save()
      console.log(`<Host> assigned for [${room_id}] / [User ID=${user.id}]`)
      socket.emit("roomInfo", room_id, "host");

    } else if (await player_count > 2) {
      console.log("Sorry, the room is full.")

    } else if (rooms[room_id].host_id == user.id) {
      console.log(`<Host> exist already / [User ID=${user.id}]`)
      socket.request["session"].room = { id: room_id, player_type: "host" }
      socket.request["session"].save()
      socket.emit("roomInfo", room_id, "host");
    } else if (rooms[room_id].guest_id == user.id) {
      console.log(`<Guest> exist already / [User ID=${user.id}]`)
      socket.request["session"].room = { id: room_id, player_type: "guest" }
      socket.request["session"].save()
      console.table(rooms[room_id])
      socket.emit("roomInfo", room_id, "guest");

    } else if (rooms[room_id].host_id == user.id && rooms[room_id].guest_id == user.id) {
      console.log(`ID exist in room as <Host> & <Guest> => Remove <Guest> / [User ID=${user.id}]`)
      delete rooms[room_id].guest_id
      socket.request["session"].room = { id: room_id, player_type: "host" }
      socket.request["session"].save()
      socket.emit("roomInfo", room_id, "host");

    } else {
      console.log(`<Guest> assigned for [${room_id}] / [User ID=${user.id}]`)
      rooms[room_id].guest_id = user.id
      rooms[room_id].gameStats.guest_id = user.id;
      socket.request["session"].room = { id: room_id, player_type: "guest" }
      socket.request["session"].save()
      socket.emit("roomInfo", room_id, "guest");

    }

    console.table(rooms[room_id])

  });

  // Page Loaded
  socket.on("onPageLoad", (data: any) => {
    // console.log("onPageLoad = ", data);
  });

  // Room Chat
  socket.on("chat", (data: any) => {
    io.in(socket.request["session"].room.id).emit("chat", data)
  });

  // Check Player Readiness for "Game"
  socket.on("playerReadyToStartGame", async () => {

    let room_id = socket.request["session"].room.id
    let room = rooms[room_id]

    console.log(`<Ready To Start Game> [Room_ID = ${room_id}] `)
    console.log('Room Info:')
    console.table(room)

    if (room.host_id === user.id) {
      room.hostReady = true;
      console.log(`[User ID=${user.id}] <Host> is ready.`);
      console.log("Host's room record:")
      console.table(room)
    } else if (room.guest_id === user.id) {
      room.guestReady = true;
      console.log(`[User ID=${user.id}] <Guest> is ready.`);
      console.log("Guest's room record:")
      console.table(room)
    }

    if (!room.hostReady || !room.guestReady) {
      console.log(`<Initialize Game> Ready: Host=${room.hostReady} Guest=${room.guestReady}. [Room ID=${room_id}]`);
      return;

    } else if (room.gameInitialized === true || room.roundInitialized === true) {
      console.log(`<Initialize Game> Game=${room.gameInitialized} Round=${room.roundInitialized} [Room ID=${room_id}]`);
      return;

    } else {
      console.log(`<Initialize Game> Both players are ready. [Room ID=${room_id}]`);
      console.table(room)

      const host_deck = await gameController.getCards_Shuffle(socket);
      const guest_deck = await gameController.getCards_Shuffle(socket);

      if (room.host_id === user.id) {
        socket.emit("initial", "Initialize Game", host_deck)
        socket.to(room_id).emit("initial", "Initialize Game", guest_deck);
      } else if (room.guest_id === user.id) {
        socket.emit("initial", "Initialize Game", guest_deck)
        socket.to(room_id).emit("initial", "Initialize Game", host_deck);
      }

      room.gameInitialized = true;
      room.host_Reborn = false;
      room.guest_Reborn = false;
      room.host_AllowSelectCard = true;
      room.guest_AllowSelectCard = true;
    }
  });

  // Select Card To Battle
  socket.on("selectCard", (card_id: any) => {

    let room_id = socket.request["session"].room.id
    let room = rooms[room_id]

    if (room.host_AllowSelectCard === false && room.guest_AllowSelectCard === false) {
      console.log("Players are not allowed to change card now.");
      return;
    } else {
      if (room.host_id === user.id && room.host_AllowSelectCard === true) {
        console.log(`<Host> selected card ID=${card_id}`);
        room.host_card = card_id;
        room["gameStats"].host_card = card_id;
        socket.emit("selectCard", "Host", card_id)

      } else if (room.guest_id === user.id && room.guest_AllowSelectCard === true) {
        console.log(`<Guest> selected card ID=${card_id}`);
        room.guest_card = card_id;
        room["gameStats"].guest_card = card_id;
        socket.emit("selectCard", "Guest", card_id)

      }
    }
  });

  socket.on("confirmCardSelection", async (card_HTML) => {

    let room_id = socket.request["session"].room.id
    let room = rooms[room_id]
    let gameStats = room["gameStats"]
    let hostCardID = room["gameStats"].host_card
    let guestCardID = room["gameStats"].guest_card

    if (room.roundInitialized === true) {
      return;

    } else {
      if (room.host_id === user.id && room.host_AllowSelectCard === true) {
        console.log(`<Host> Confirm Card Selection`);
        room.host_ConfirmSelection = true;
        room.hostCardHTML = card_HTML;
      } else if (room.guest_id === user.id && room.guest_AllowSelectCard === true) {
        console.log(`<Guest> Confirm Card Selection`);
        room.guest_ConfirmSelection = true;
        room.guestCardHTML = card_HTML;
      }
      if (room.host_card === undefined || room.guest_card === undefined) {
        return;

      } else if (room.host_ConfirmSelection === true && room.guest_ConfirmSelection === true) {
        console.log("<Host> selected card id = ", hostCardID, " & <Guest> selected card id = ", guestCardID);

        room.roundInitialized = true;
        room.host_AllowSelectCard = false;
        room.guest_AllowSelectCard = false

        const host_card = await gameController.io_Get_Card_Data(socket, hostCardID);
        const guest_card = await gameController.io_Get_Card_Data(socket, guestCardID);

        if (room.host_Reborn === false && room.guest_Reborn === false) {
          rooms[room_id].gameStats = {
            host_id: room.host_id,
            host_card: host_card["id"],
            host_hp: host_card["hp"],
            host_atk: host_card["atk"],
            host_skill: host_card["skill_id"],
            guest_id: room.guest_id,
            guest_card: guest_card["id"],
            guest_hp: guest_card["hp"],
            guest_atk: guest_card["atk"],
            guest_skill: guest_card["skill_id"],
            action: null,
            damage: null,
          };
        } else if (room.host_Reborn) {
          gameStats.host_card = host_card["id"];
          gameStats.host_hp = host_card["hp"];
          gameStats.host_atk = host_card["atk"];
          gameStats.host_skill = host_card["skill_id"];
          gameStats.action = null;
          gameStats.damage = null;

        } else if (room.guest_Reborn) {
          gameStats.guest_card = guest_card["id"];
          gameStats.guest_hp = guest_card["hp"];
          gameStats.guest_atk = guest_card["atk"];
          gameStats.guest_skill = guest_card["skill_id"];
          gameStats.action = null;
          gameStats.damage = null;
        }

        console.log(`Room's game stats {room["gameStats"]}:`)
        console.table(room["gameStats"])

        // Place card to Battle Zone
        io.in(room_id).emit("placeCard",
          "host", room.hostCardHTML, host_card,
          "guest", room.guestCardHTML, guest_card);
      }
    }
  });


  socket.on("reset", () => {
    console.log("Client request to reset game");

    let room_id = socket.request["session"].room.id
    console.log(room_id)
    resetGame(room_id);
  });

  // Both Players Placed Card in Battle Zone <Start Game>
  socket.on("placeCard", (status) => {
    let room_id = socket.request["session"].room.id
    let room = rooms[room_id]

    if (room.host_id === user.id && status.success === true) {
      room.host_PlaceCard = true
      console.log("Received notification from <Host> finishes place card.")
    } else if (room.guest_id === user.id && status.success === true) {
      room.guest_PlaceCard = true
      console.log("Received notification from <Guest> finishes place card.")
    }
    if (room.host_PlaceCard === true && room.guest_PlaceCard == true) {
      room.host_ReadyNextRound = true;
      room.guest_ReadyNextRound = true;
      startGame(room_id);
    }
  });

  // Check Player Readiness for "Next Round"
  socket.on("nextRound", () => {

    let room_id = socket.request["session"].room.id
    let room = rooms[room_id]

    if (room.roundInitialized === true) {
      return;
    } else {
      if (room.host_id === user.id) {
        room.host_ReadyNextRound = true;
        console.log(`<Host> is ready for next round.`);

      } else if (room.guest_id === user.id) {
        room.guest_ReadyNextRound = true;
        console.log(`[Guest] is ready for next round.`);

      }
      if (!room.host_ReadyNextRound || !room.guest_ReadyNextRound) {
        return;

      } else {
        console.log("Both players are ready. Game will start.");
        io.in(room_id).emit("startGame", true);

        (async () => {
          await setTimeoutPromise(200).then(() => {
            io.in(room_id).emit("nextRound", "下回合將會係3秒後開始...");
          });
          await setTimeoutPromise(500).then(() => {
            io.in(room_id).emit("nextRound", "3");
          });
          await setTimeoutPromise(1000).then(() => {
            io.in(room_id).emit("nextRound", "2");
          });
          await setTimeoutPromise(1000).then(() => {
            io.in(room_id).emit("nextRound", "1");
          });
          await setTimeoutPromise(1000).then(() => {
            io.in(room_id).emit("nextRound", "開始倒數");
          });
          await setTimeoutPromise(500).then(() => {
            startCountdownTimer(room_id);
          });
        })();
      }
    }
  });

  // Rock Paper Scissor (selection received from players)
  socket.on("move", async (move: string) => {

    let room_id = socket.request["session"].room.id
    let room = rooms[room_id]
    let gameStats = room["gameStats"]

    if (room.host_ReadyNextRound === true && room.guest_ReadyNextRound === true) {
      if (room.host_id === user.id) {
        room.host_Move = move;
        console.log(`<Host> = ${move}`);
      } else if (room.guest_id === user.id) {
        room.guest_Move = move;
        console.log(`<Guest> = ${move}`);
      }
      if (!room.host_Move || !room.guest_Move) {
        return;

      } else {

        // Both player choose a move, determine the winner
        stopCountdownTimer(room_id);
        const result = rockPaperScissor(room.host_Move, room.guest_Move);
        io.in(room_id).emit("result", result);

        // Tie and rematch without confirmation
        if (result["winner"] === "tie") {
          room.host_Move = null;
          room.guest_Move = null;
          (async () => {
            await setTimeoutPromise(200).then(() => {
              io.in(room_id).emit("nextRound", "下回合將會係3秒後開始...");
            });
            await setTimeoutPromise(500).then(() => {
              io.in(room_id).emit("nextRound", "3");
            });
            await setTimeoutPromise(1000).then(() => {
              io.in(room_id).emit("nextRound", "2");
            });
            await setTimeoutPromise(1000).then(() => {
              io.in(room_id).emit("nextRound", "1");
            });
            await setTimeoutPromise(1000).then(() => {
              io.in(room_id).emit("nextRound", "開始倒數");
            });
            await setTimeoutPromise(500).then(() => {
              startCountdownTimer(room_id);
            });
          })();
        } else {

          // Determine winner and deal damage
          dealDamage(result, gameStats)

          // Check HP of card in action to determine if defeated
          // returns [0]playerDied, [1]]updated gameStats
          let playerDied = checkHP(room_id, gameStats)

          if (playerDied) {
            if (playerDied[0] === room.host_id) {
              gameStats.host_hp = "敗陣"
              gameStats.host_atk = "-"
              socket.emit("replaceCard", room.host_card)
            }
            else if (playerDied[0] === room.guest_id) {
              gameStats.guest_hp = "敗陣"
              gameStats.guest_atk = "-"
              socket.emit("replaceCard", room.guest_card)
            }
          }
          io.in(room_id).emit("gameStats", gameStats);
        }
      }
    }
  });

  // socket.on("replaceCard", () => {
  // })

  socket.on('disconnect', function () {
    // userIsConnected = false;
    // setTimeout(function () {
    //     if (!userIsConnected) currentUIDS.pop(currentUID);
    // }, 15000);

    console.log(`socket.request["session"]?.room`, socket.request["session"]?.room)

    let room_id = socket.request["session"]?.room?.id
    // let room = rooms[room_id]

    console.log(`Socket: [socket.id] is Disconnect [Room ID=${room_id}]`)

    delete socket.request["session"]?.room
    // console.log(room)
    // let room_id = socket.request["session"]?.room?.id
    // let room = rooms[room_id]

    // if (room?.host_id === user?.id) {
    //   delete room.host_id
    // } else if (room?.guest_id === user?.id) {
    //   delete room.guest_id
    // }
    // if (room.host_id === undefined && room.guest_id === undefined) {
    //   delete rooms[room_id]
    // }
  });

  // ------------------------------------------------------------------------------------
  // Socket IO FUNCTION

  // Send Start Game Notification & turn on Timer
  function startGame(room_id: any) {

    io.in(room_id).emit("startGame", true);

    (async () => {
      await setTimeoutPromise(200).then(() => {
        io.in(room_id).emit("nextRound", "遊戲將會係3秒後開始...");
      });
      await setTimeoutPromise(500).then(() => {
        io.in(room_id).emit("nextRound", "3");
      });
      await setTimeoutPromise(1000).then(() => {
        io.in(room_id).emit("nextRound", "2");
      });
      await setTimeoutPromise(1000).then(() => {
        io.in(room_id).emit("nextRound", "1");
      });
      await setTimeoutPromise(1000).then(() => {
        io.in(room_id).emit("nextRound", "開始倒數");
      });
      await setTimeoutPromise(500).then(() => {
        startCountdownTimer(room_id);
      });
    })()
  }

  // Start Timer
  function startCountdownTimer(room_id: any) {
    io.in(room_id).emit("startTimer", true);
    console.log("Start counting down 10s");
  }

  // Stop Timer
  function stopCountdownTimer(room_id: any) {
    io.in(room_id).emit("startTimer", false);
    io.in(room_id).emit("startGame", false);
    console.log("Stop Timer");
  }

  // Restart Timer with Delay (Promisify)
  const setTimeoutPromise = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Restart Timer with Delay (Original) Not in use
  // function LongSetTimeoutPromise(ms: number) {
  //   return new Promise(function (resolve) {
  //     setTimeout(resolve, ms);
  //   });
  // }

  // Reset Game & Game Stats
  function resetGame(room_id: any) {
    console.log("Game Reset")

    let host_id = rooms[room_id].host_id
    let guest_id = rooms[room_id].guest_id

    rooms[room_id] = {}
    rooms[room_id].host_id = host_id
    rooms[room_id].guest_id = guest_id

    let room = rooms[room_id]
    room["gameStats"] = {}
    room["gameStats"].host_id = host_id
    room["gameStats"].guest_id = guest_id

    io.in(room_id).emit("resetGame");

    console.table(rooms[room_id])
    console.table(rooms[room_id].gameStats)
  }

  function dealDamage(resultObject: any, gameStats: any) {

    if (resultObject["winner"] === "host") {
      gameStats["action"] = resultObject["winner"];
      gameStats["guest_hp"] = gameStats["guest_hp"] - gameStats["host_atk"];
      gameStats["damage"] = gameStats["host_atk"];
    } else if (resultObject["winner"] === "guest") {
      gameStats["action"] = resultObject["winner"];
      gameStats["host_hp"] = gameStats["host_hp"] - gameStats["guest_atk"];
      gameStats["damage"] = gameStats["guest_atk"];
    }
    return gameStats

  }

  function checkHP(room_id: any, gameStats: any): any {

    if (gameStats["host_hp"] > 0 && gameStats["guest_hp"] > 0) {
      rooms[room_id].roundInitialized = false;
      rooms[room_id].host_Move = undefined;
      rooms[room_id].guest_Move = undefined;
      rooms[room_id].host_ReadyNextRound = false;
      rooms[room_id].guest_ReadyNextRound = false;
      return [null, gameStats]

    } else if (gameStats["host_hp"] <= 0) {
      rooms[room_id].roundInitialized = false;
      rooms[room_id].host_Move = undefined;
      rooms[room_id].guest_Move = undefined;
      rooms[room_id].host_ReadyNextRound = false;
      rooms[room_id].guest_ReadyNextRound = false;
      rooms[room_id].host_AllowSelectCard = true
      rooms[room_id].host_ConfirmSelection = false;
      rooms[room_id].host_PlaceCard = false;
      rooms[room_id].host_Reborn = true;
      return [rooms[room_id].host_id, gameStats]

    } else if (gameStats["guest_hp"] <= 0) {
      rooms[room_id].roundInitialized = false;
      rooms[room_id].host_Move = undefined;
      rooms[room_id].guest_Move = undefined;
      rooms[room_id].host_ReadyNextRound = false;
      rooms[room_id].guest_ReadyNextRound = false;
      rooms[room_id].guest_AllowSelectCard = true
      rooms[room_id].guest_ConfirmSelection = false
      rooms[room_id].guest_PlaceCard = false;
      rooms[room_id].guest_Reborn = true;
      return [rooms[room_id].guest_id, gameStats]

    }
  }

  // Rock Paper Scissor
  enum Move {
    Rock = "rock",
    Paper = "paper",
    Scissor = "scissor",
  }
  enum Result {
    Tie = "tie",
    Host = "host",
    Guest = "guest",
  }

  function rockPaperScissor(host_Move: Move, guest_Move: Move): any {
    if (host_Move === guest_Move) {
      return { host: host_Move, guest: guest_Move, winner: Result.Tie };
    } else if (host_Move === Move.Rock && guest_Move === Move.Scissor) {
      return { host: host_Move, guest: guest_Move, winner: Result.Host };
    } else if (host_Move === Move.Rock && guest_Move === Move.Paper) {
      return { host: host_Move, guest: guest_Move, winner: Result.Guest };
    } else if (host_Move === Move.Paper && guest_Move === Move.Scissor) {
      return { host: host_Move, guest: guest_Move, winner: Result.Guest };
    } else if (host_Move === Move.Paper && guest_Move === Move.Rock) {
      return { host: host_Move, guest: guest_Move, winner: Result.Host };
    } else if (host_Move === Move.Scissor && guest_Move === Move.Paper) {
      return { host: host_Move, guest: guest_Move, winner: Result.Host };
    } else if (host_Move === Move.Scissor && guest_Move === Move.Rock) {
      return { host: host_Move, guest: guest_Move, winner: Result.Guest };
    }
  }

  // function rockPaperScissorV2(user1: Move, user2: Move): any {
  //   const choices = ["rock", "paper", "scissor"];
  //   const index1 = choices.indexOf(user1);
  //   const index2 = choices.indexOf(user2);
  //   if (index1 == index2) {
  //     return { host: user1, guest: user2, winner: Result.Tie };
  //   }
  //   if (mod(index1 - index2, choices.length) < choices.length / 2) {
  //     return { host: user1, guest: user2, winner: Result.Host };
  //   } else {
  //     return { host: user1, guest: user2, winner: Result.Guest };
  //   }
  // }
  // function mod(a: any, b: any) {
  //   const c = a % b;
  //   return c < 0 ? c + b : c;
  // }
});


app.use(express.static(path.join(__dirname + "/public")));
app.use("/utils", express.static("utils"));
app.use("/uploads", express.static("uploads"));
app.use("/output", express.static("output"));
app.use("/export", express.static("export"));
app.use(isLoggedInAPI, express.static(path.join(__dirname + "/private")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`);
});

export function checkServerIP() {
  let network_obj = networkInterfaces();
  let en_zero;
  if (process.platform == "win32") {
    en_zero = network_obj["Wi-Fi"];
  } else {
    en_zero = network_obj["en0"];
  }

  if (!en_zero) {
    console.log("Cannot get server info.");
  } else {
    console.log(`Local Server IP: http://${en_zero[1].address}:${PORT}\n`);
  }
}
checkServerIP();

declare module "express-session" {
  interface SessionData {
    user?: { id: number; username: string; user_type?: string; email?: string; room_id?: string };
  }
}

declare module "express" {
  interface Request {
    form?: any;
  }
}
