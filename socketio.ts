import { io, sessionMiddleware } from "./server";
import express from "express";

io.use((socket, next) => {
  let req = socket.request as express.Request;
  let res = req.res as express.Response;
  sessionMiddleware(req, res, next as express.NextFunction);
});

// DECLARE GLOBAL VARIABLES //

// Rock Paper Scissor
let hostMove: any = undefined;
let guestMove: any = undefined;

// Player Readiness for game
let hostReady: any = undefined;
let guestReady: any = undefined;

// Game Initialized Status
let gameInitialized: any = false;

// Round Initialized Status
let roundInitialized: any = false;

// Player Readiness for Next Round
let hostNextReady: any = true;
let guestNextReady: any = true;

// Allow to Select Card To Battle
let allowToSelectCardToBattle: any = true;

// Cards Selected To Battle
let hostCard = "";
let hostCardHTML = "";
let guestCard = "";
let guestCardHTML = "";

// Confirms Card Selected To Battle
let hostConfirmedSelection: any = false;
let guestConfirmedSelection: any = false;

// Game Stats
let gameStats: any = {};

io.on("connection", function (socket) {
  console.log(`\nSocket ID:`, socket.id, "[Connected]");

  // Test Python
  // socket.on('testPython', () => {
  //   sendToPythonServer("cat.jpeg")

  //   console.log("\nTest Python")
  // })

  // Client say hello to server
  socket.on("hello", (data: any) => {
    console.log("\n" + data["msg"]);
  });

  // Client request to create room (joinRoom Page)
  socket.on("createRoom", (data: any) => {
    console.log("\n" + data["msg"]);

    // Assign "room-1" to Host
    socket.emit("assignRoom", { room: "room-1" }, { type: "host" });
  });

  // Guest Join "room-1"
  socket.on("joinRoom", (data: any) => {
    socket.join("room-1");
    socket.emit("roomInfo", { msg: "You joined room" }, { room: "room-1" });
    if (socket)
      // Return all Player ID from "room-1"
      (async function () {
        const room = await io.in("room-1").fetchSockets();
        let count = 0;
        console.log(`\n[${room.length}] Player(s) in Room-1`);
        for (let id of room) {
          count++;
          console.log(`Room-1 [Player ${count}]: socket.id =`, id["id"]);
        }
      })();
  });

  // Page Loaded
  socket.on("onPageLoad", (data: any) => {
    console.log(data);
    io.to("room-1").emit(
      "new-player",
      `A player ${socket.id} had joined the room. [room-id: ${socket.rooms}]`
    );
  });

  // Room Chat
  socket.on("chat", (data: any) => {
    socket.to("room-1").emit("chat", data);
  });

  // Check Player Readiness for "Game"
  socket.on("playerReadyToStartGame", (type: string) => {
    console.log(`Player [${type}] is ready [ID=${socket.id}]`);
    if (type === "host") {
      hostReady = true;
    } else if (type === "guest") {
      guestReady = true;
    }
    if (!hostReady || !guestReady) {
      return;
    } else if (gameInitialized === true) {
      return;
    } else {
      console.log("Both players are ready. <Initialize Game>");
      socket.emit("initial", "Initialize Game");
      io.to("room-1").emit("initial", "Initialize Game");
      gameInitialized = true;
      gameStats["round"] = 0;
    }
  });

  // Select Card To Battle
  socket.on("selectCard", (player_type: any, card_id: any, card_HTML: any) => {
    console.log("'selectCard' ", " card ID = ", card_id);
    if (roundInitialized === true || allowToSelectCardToBattle === false) {
      console.log("Cannot change card now.");
      return;
    } else {
      if (player_type === "host") {
        hostCard = card_id;
        hostCardHTML = card_HTML;
        gameStats["host"].card = card_id;
      } else if (player_type === "guest") {
        guestCard = card_id;
        guestCardHTML = card_HTML;
        gameStats["guest"].card = card_id;
      }
    }
  });

  socket.on("confirmCardSelection", (type) => {
    if (roundInitialized === true) {
      return;
    } else {
      if (type === "host") {
        hostConfirmedSelection = true;
      } else if (type === "guest") {
        guestConfirmedSelection = true;
      }
      if (hostConfirmedSelection === true && guestConfirmedSelection === true) {
        console.log("Host selected = ", hostCard, " & Guest selected = ", guestCard);

        // Place card to Battle Zone
        socket.emit("placeCard", "host", hostCardHTML, "guest", guestCardHTML);
        io.to("room-1").emit("placeCard", "host", hostCardHTML, "guest", guestCardHTML);
        roundInitialized = true;
        allowToSelectCardToBattle = false;
        hostConfirmedSelection = false;
        guestConfirmedSelection = false;
      }
    }
  });

  // Both Players Placed Card in Battle Zone <Start Game>
  socket.on("placeCard", (status) => {
    if (status.success) {
      startGame(hostReady, guestReady);
    }
  });

  // Check Player Readiness for "Next Round"
  socket.on("nextRound", (type: string) => {
    if (roundInitialized === true) {
      return;
    } else {
      console.log(`[${type}] is ready for next round.`);
      if (type === "host") {
        hostNextReady = true;
      } else if (type === "guest") {
        guestNextReady = true;
      }
      if (!hostNextReady || !guestNextReady) {
        return;
      } else {
        console.log("Both players are ready, game will start.");
        (async () => {
          await setTimeoutPromise(1000).then(() => {
            io.to("room-1").emit("nextRound", "下回合將會係3秒後開始...");
          });
          await setTimeoutPromise(1000).then(() => {
            io.to("room-1").emit("nextRound", "3");
          });
          await setTimeoutPromise(1000).then(() => {
            io.to("room-1").emit("nextRound", "2");
          });
          await setTimeoutPromise(1000).then(() => {
            io.to("room-1").emit("nextRound", "1");
          });
          await setTimeoutPromise(1000).then(() => {
            io.to("room-1").emit("nextRound", "開始倒數");
          });
          await setTimeoutPromise(1000).then(() => {
            startCountdownTimer();
          });
        })();
      }
    }
  });

  // Rock Paper Scissor (selection received from players)
  socket.on("move", (move: string, type: string) => {
    console.log("'move' ", type, " = ", move);
    if (hostNextReady === true && guestNextReady === true) {
      if (type === "host") {
        hostMove = move;
      } else if (type === "guest") {
        guestMove = move;
      }
      if (!hostMove || !guestMove) {
        return;
      } else {
        // Both player choose a move, determine the winner
        stopCountdownTimer();
        const resultObject = rockPaperScissor(hostMove, guestMove);
        io.to("room-1").emit("result", resultObject);

        // Winner deal damage
        damage = 500;
        io.to("room-1").emit("gameStats", resultObject.winner, damage);
        hostMove = undefined;
        guestMove = undefined;
        hostNextReady = false;
        guestNextReady = false;
        roundInitialized = false;
      }
    } else {
      console.error("Player(s) not ready.");
    }
  });
});

// Calculate Damage
export async function calDamage() {}

// Send Start Game Notification & turn on Timer
async function startGame(hostReady: boolean | undefined, guestReady: boolean | undefined) {
  await setTimeoutPromise(1000).then(() => {
    io.to("room-1").emit("nextRound", "遊戲將會係3秒後開始...");
  });
  await setTimeoutPromise(1000).then(() => {
    io.to("room-1").emit("nextRound", "3");
  });
  await setTimeoutPromise(1000).then(() => {
    io.to("room-1").emit("nextRound", "2");
  });
  await setTimeoutPromise(1000).then(() => {
    io.to("room-1").emit("nextRound", "1");
  });
  await setTimeoutPromise(1000).then(() => {
    io.to("room-1").emit("nextRound", "開始倒數");
  });
  await setTimeoutPromise(1000).then(() => {
    startCountdownTimer();
    hostReady = undefined;
    guestReady = undefined;
    // return { hostReady, guestReady }
  });
}

// Start Timer
async function startCountdownTimer() {
  await setTimeoutPromise(500).then(() => {
    io.to("room-1").emit("startGame", true);
    console.log("Start counting down 10s");
  });
}

// Stop Timer
function stopCountdownTimer() {
  io.to("room-1").emit("startGame", false);
}

// Restart Timer with Delay (Promisify)
const setTimeoutPromise = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Restart Timer with Delay (Original) Not in use
export function LongSetTimeoutPromise(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// Rock Paper Scissor
enum Move {
  Rock = "rock",
  Paper = "paper",
  Scissor = "scissor",
}
enum Result {
  Tie = "打和",
  Host = "host",
  Guest = "guest",
}

export function rockPaperScissor(hostMove: Move, guestMove: Move): any {
  if (hostMove === guestMove) {
    return { host: hostMove, guest: guestMove, winner: Result.Tie };
  } else if (hostMove === Move.Rock && guestMove === Move.Scissor) {
    return { host: hostMove, guest: guestMove, winner: Result.Host };
  } else if (hostMove === Move.Rock && guestMove === Move.Paper) {
    return { host: hostMove, guest: guestMove, winner: Result.Guest };
  } else if (hostMove === Move.Paper && guestMove === Move.Scissor) {
    return { host: hostMove, guest: guestMove, winner: Result.Guest };
  } else if (hostMove === Move.Paper && guestMove === Move.Rock) {
    return { host: hostMove, guest: guestMove, winner: Result.Host };
  } else if (hostMove === Move.Scissor && guestMove === Move.Paper) {
    return { host: hostMove, guest: guestMove, winner: Result.Host };
  } else if (hostMove === Move.Scissor && guestMove === Move.Rock) {
    return { host: hostMove, guest: guestMove, winner: Result.Guest };
  }
}

export function rockPaperScissorV2(user1: Move, user2: Move): any {
  const choices = ["rock", "paper", "scissor"];
  const index1 = choices.indexOf(user1);
  const index2 = choices.indexOf(user2);
  if (index1 == index2) {
    return { host: user1, guest: user2, winner: Result.Tie };
  }
  if (mod(index1 - index2, choices.length) < choices.length / 2) {
    return { host: user1, guest: user2, winner: Result.Host };
  } else {
    return { host: user1, guest: user2, winner: Result.Guest };
  }
}
export function mod(a: any, b: any) {
  const c = a % b;
  return c < 0 ? c + b : c;
}

// Reset Game
export function resetGame() {
  io.to("room-1").emit("resetGame", "Reset Game");
  gameInitialized = false;
  hostMove = undefined;
  guestMove = undefined;
  hostReady = undefined;
  guestReady = undefined;
  hostNextReady = true;
  guestNextReady = true;
  allowToSelectCardToBattle = true;
  hostCard = "";
  hostCardHTML = "";
  guestCard = "";
  guestCardHTML = "";
  hostConfirmedSelection = false;
  guestConfirmedSelection = false;
  gameStats = {};
}
