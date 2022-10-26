// import { io, rooms } from "../server"
import { io, rooms } from "../server"
import { gameController } from "../routes";
// import type { Server as SocketIO } from "socket.io";

export module IOController {
    // constructor(public io: SocketIO) { }
    // IO = async () => {


    const IO = io.on("connection", function (socket: any) {
        console.log(`\nSocket ID:`, socket.id, "[Connected]");
        console.log(socket.request["session"]);

        // DECLARE VARIABLES //
        // Game Stats
        let gameStats: any = {
            host_id: null,
            host_card: null,
            host_hp: null,
            host_atk: null,
            host_skill: null,
            guest_id: null,
            guest_card: null,
            guest_hp: null,
            guest_atk: null,
            guest_skill: null,
            action: null,
            damage: null,
        };

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
        socket.on("joinRoom", (room_id: any, player_type: any) => {
            socket.join(room_id);
            socket.emit("roomInfo", { msg: "You joined room" }, { room: room_id });
            socket.request["session"].room = { id: room_id, player_type: player_type }
            socket.request["session"].save()
            console.dir(socket.request["session"]);
            console.table(socket.request["session"]);
            if (!rooms[room_id]) {
                rooms[room_id] = {}
                rooms[room_id].gameStats = gameStats;
                rooms[room_id].gameStats.host_id = user.id;
                rooms[room_id].host_id = user.id
            } else {
                rooms[room_id].guest_id = user.id
                rooms[room_id].gameStats.guest_id = user.id;
            }

            // Return all Player ID from room
            (async function () {
                const room = await IO.in(room_id).fetchSockets();
                let count = 0;
                console.log(`\n[${room.length}] Player(s) in ${room_id}`);
                for (let id of room) {
                    count++;
                    console.log(`Room ID = ${room_id} / Player[${count}]: user_id = ${user.id} socket.id = ${id["id"]}`);
                }
            })();
        });

        // Page Loaded
        socket.on("onPageLoad", (data: any) => {
            console.log("onPageLoad = ", data);
        });

        // Room Chat
        socket.on("chat", (data: any) => {
            IO.in(socket.request["session"].room.id).emit("chat", data)
        });

        // Check Player Readiness for "Game"
        socket.on("playerReadyToStartGame", () => {

            let room_id = socket.request["session"].room.id
            let room = rooms[room_id]

            console.log(`[User ID=${user.id}] Player <${room.player_type}> is ready.`);
            if (room.host_id === user.id) {
                room.hostReady = true;
                console.log("Host's room record = ", room)
            } else if (room.guest_id === user.id) {
                room.guestReady = true;
                console.log("Guest's room record = ", room)
            }
            if (!room.hostReady || !room.guestReady) {
                console.log(`Ready: Host=${room.hostReady} Guest=${room.guestReady}. Room ID=${room_id} <Initialize Game>`);
                return;
            } else if (room["gameInitialized"] === true || room["roundInitialized"] === true) {
                console.log(`Initialize: Game=${room["gameInitialized"]} Round=${room["roundInitialized"]}. Room ID=${room_id} <Initialize Game>`);
                return;
            } else {
                console.log(`Both players are ready. Room ID=${room_id} <Initialize Game>`);
                IO.in(room_id).emit("initial", "Initialize Game");
                room["gameInitialized"] = true;
                room["host_AllowSelectCard"] = true
                room["guest_AllowSelectCard"] = true
            }
        });

        // Select Card To Battle
        socket.on("selectCard", (card_id: any, card_HTML: any) => {
            console.log("'selectCard' ", " card ID = ", card_id);

            let room_id = socket.request["session"].room.id
            let room = rooms[room_id]

            if (room["host_AllowSelectCard"] === false && room["guest_AllowSelectCard"] === false) {
                console.log("Cannot change card now.");
                return;
            } else {
                if (room.host_id === user.id && room["host_AllowSelectCard"] === true) {
                    room["gameStats"].host_card = card_id;
                    room["hostCardHTML"] = card_HTML;
                    console.log(`Host selected card ID=${room["gameStats"].host_card}`)
                    console.log(room["hostCardHTML"])
                    socket.emit("selectCard", "Host", card_id, card_HTML)
                } else if (room.guest_id === user.id && room["guest_AllowSelectCard"] === true) {
                    room["gameStats"].guest_card = card_id;
                    room["guestCardHTML"] = card_HTML;
                    console.log(`Guest selected card ID=${room["gameStats"].guest_card}`)
                    console.log(room["guestCardHTML"])
                    socket.emit("selectCard", "Guest", card_id, card_HTML)
                }
            }
        });

        socket.on("confirmCardSelection", async () => {

            let room_id = socket.request["session"].room.id
            let room = rooms[room_id]
            let hostCardID = room["gameStats"].host_card
            let guestCardID = room["gameStats"].guest_card

            let player_type = room.host_id === user.id ? "Host" : "Guest"

            console.log(`<${player_type}> Confirm Card Selection`);

            if (room["roundInitialized"] === true) {
                return;
            } else {
                if (room.host_id === user.id) {
                    room.host_ConfirmSelection = true;
                } else if (room.guest_id === user.id) {
                    room.guest_ConfirmSelection = true;
                }
                if (room.host_ConfirmSelection === true && room.guest_ConfirmSelection === true) {
                    console.log("Host selected card id = ", hostCardID, " & Guest selected card id = ", guestCardID);

                    room.roundInitialized = true;
                    room.host_ConfirmSelection = true;
                    room.guest_ConfirmSelection = true;
                    room.host_AllowSelectCard = false;
                    room.guest_AllowSelectCard = false

                    // use card_id from globe
                    const host_card = await gameController.io_Get_Card_Data(socket, hostCardID);
                    const guest_card = await gameController.io_Get_Card_Data(socket, guestCardID);

                    room["gameStats"] = {
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

                    console.log(`Room[${room}]`)
                    console.log(`Room's game stats:`)
                    console.table(`${room["gameStats"]}`)

                    // Place card to Battle Zone
                    IO.in(room_id).emit("placeCard",
                        "host", room["hostCardHTML"], host_card,
                        "guest", room["guestCardHTML"], guest_card);
                }
            }
        });


        socket.on("reset", () => {
            console.log("Client request to reset game");

            let room_id = socket.request["session"].room.id

            resetGame(room_id);
        });

        // Both Players Placed Card in Battle Zone <Start Game>
        socket.on("placeCard", (status: any) => {
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
                startGame(room.hostReady, room.guestReady, room_id);
            }
        });

        // Check Player Readiness for "Next Round"
        socket.on("nextRound", (type: string) => {

            let room_id = socket.request["session"].room.id
            let room = rooms[room_id]

            if (room.roundInitialized === true) {
                return;
            } else {
                console.log(`[${type}] is ready for next round.`);
                if (room.host_id === user.id) {
                    room.host_ReadyNextRound = true;
                } else if (room.guest_id === user.id) {
                    room.guest_ReadyNextRound = true;
                }
                if (!room.host_ReadyNextRound || !room.guest_ReadyNextRound) {
                    return;
                } else {
                    console.log("Both players are ready, game will start.");
                    IO.in(room_id).emit("startGame", true);

                    (async () => {
                        await setTimeoutPromise(200).then(() => {
                            IO.in(room_id).emit("nextRound", "下回合將會係3秒後開始...");
                        });
                        await setTimeoutPromise(500).then(() => {
                            IO.in(room_id).emit("nextRound", "3");
                        });
                        await setTimeoutPromise(1000).then(() => {
                            IO.in(room_id).emit("nextRound", "2");
                        });
                        await setTimeoutPromise(1000).then(() => {
                            IO.in(room_id).emit("nextRound", "1");
                        });
                        await setTimeoutPromise(1000).then(() => {
                            IO.in(room_id).emit("nextRound", "開始倒數");
                        });
                        await setTimeoutPromise(500).then(() => {
                            startCountdownTimer();
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

            console.log(`'move' <${room.player_type}> = "${move}`);
            if (room["host_ReadyNextRound"] === true && room["guest_ReadyNextRound"] === true) {
                if (room.player_type === "host") {
                    room.host_Move = move;
                } else if (room.player_type === "guest") {
                    room.guest_Move = move;
                }
                if (!room.host_Move || !room.guest_Move) {
                    return;
                } else {
                    // Both player choose a move, determine the winner
                    stopCountdownTimer(room_id);
                    const resultObject = rockPaperScissor(room.host_Move, room.guest_Move);
                    IO.in(room_id).emit("result", resultObject);

                    // Tie and rematch without confirmation
                    if (resultObject["winner"] === "tie") {
                        room.host_Move = null;
                        room.guest_Move = null;
                        IO.in(room_id).emit("startGame", true);

                        (async () => {
                            await setTimeoutPromise(1500).then(() => {
                                IO.in(room_id).emit("nextRound", "下回合將會係3秒後開始...");
                            });
                            await setTimeoutPromise(500).then(() => {
                                IO.in(room_id).emit("nextRound", "3");
                            });
                            await setTimeoutPromise(1000).then(() => {
                                IO.in(room_id).emit("nextRound", "2");
                            });
                            await setTimeoutPromise(1000).then(() => {
                                IO.in(room_id).emit("nextRound", "1");
                            });
                            await setTimeoutPromise(1000).then(() => {
                                IO.in(room_id).emit("nextRound", "開始倒數");
                            });
                            await setTimeoutPromise(500).then(() => {
                                startCountdownTimer();
                            });
                        })();
                    } else {

                        if (resultObject["winner"] === "host") {
                            gameStats["action"] = resultObject["winner"];
                            gameStats["guest_hp"] = gameStats["guest_hp"] - gameStats["host_atk"];
                            gameStats["damage"] = gameStats["host_atk"];
                        } else if (resultObject["winner"] === "guest") {
                            gameStats["action"] = resultObject["winner"];
                            gameStats["host_hp"] = gameStats["host_hp"] - gameStats["guest_atk"];
                            gameStats["damage"] = gameStats["guest_atk"];
                        }

                        if (gameStats["host_hp"] > 0 && gameStats["guest_hp"] > 0) {

                            IO.in(room_id).emit("gameStats", gameStats);
                            room.host_Move = undefined;
                            room.guest_Move = undefined;
                            room.host_ReadyNextRound = false;
                            room.guest_ReadyNextRound = false;
                            room.roundInitialized = false;

                        } else if (gameStats["host_hp"] <= 0) {
                            gameStats["host_hp"] = "陣亡"
                            gameStats["host_atk"] = "-"
                            IO.in(room_id).emit("gameStats", gameStats);

                            room.host_Move = undefined;
                            room.guest_Move = undefined;
                            room.host_ReadyNextRound = false;
                            room.guest_ReadyNextRound = false;
                            room.roundInitialized = false;
                            room.host_ConfirmSelection = false;
                            room.host_PlaceCard = false;

                            socket.emit("replaceCard", gameStats)

                        } else if (gameStats["guest_hp"] <= 0) {
                            gameStats["guest_hp"] = "陣亡"
                            gameStats["guest_atk"] = "-"
                            socket.emit("gameStats", gameStats);
                            IO.in(room_id).emit("gameStats", gameStats);

                            room.host_Move = undefined;
                            room.guest_Move = undefined;
                            room.host_ReadyNextRound = false;
                            room.guest_ReadyNextRound = false;
                            room.roundInitialized = false;
                            room.guest_ConfirmSelection = false
                            room.guest_PlaceCard = false;
                            stopCountdownTimer(room_id)
                            socket.emit("replaceCard", gameStats)
                        }
                    }
                }
            }
        });

        socket.on("replaceCard", () => {
        })

        socket.on("disconnect", () => { })

        // socket.disconnected


        // Socket IO FUNCTION

        // Send Start Game Notification & turn on Timer
        function startGame(host_ready: boolean, guest_ready: boolean, room_id: any) {
            console.log("Room [", room_id, "] Ready Status: Host=", host_ready, " & ", "Guest=", guest_ready)

            if (host_ready === true && guest_ready === true) {
                IO.in(room_id).emit("startGame", true);

                (async () => {
                    await setTimeoutPromise(200).then(() => {
                        IO.in(room_id).emit("nextRound", "遊戲將會係3秒後開始...");
                    });
                    await setTimeoutPromise(500).then(() => {
                        IO.in(room_id).emit("nextRound", "3");
                    });
                    await setTimeoutPromise(1000).then(() => {
                        IO.in(room_id).emit("nextRound", "2");
                    });
                    await setTimeoutPromise(1000).then(() => {
                        IO.in(room_id).emit("nextRound", "1");
                    });
                    await setTimeoutPromise(1000).then(() => {
                        IO.in(room_id).emit("nextRound", "開始倒數");
                    });
                    await setTimeoutPromise(500).then(() => {
                        startCountdownTimer();
                    });
                })()

            } else {
            }
        }

        // Start Timer
        async function startCountdownTimer() {
            await setTimeoutPromise(500).then(() => {
                socket.emit("startTimer", true)
                    ;
                console.log("Start counting down 10s");
            });
        }

        // Stop Timer
        function stopCountdownTimer(room_id: any) {
            // socket.emit("startGame", false)
            IO.in(room_id).emit("startTimer", false);
            IO.in(room_id).emit("startGame", false);
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
            IO.in(room_id).emit("resetGame", "Reset Game");
            // gameInitialized = false;
            // roundInitialized = false;
            // host_Move = undefined;
            // guest_Move = undefined;
            // hostReady = undefined;
            // guestReady = undefined;
            // host_ReadyNextRound = true;
            // guest_ReadyNextRound = true;
            // host_AllowSelectCard = true;
            // guest_AllowSelectCard = true;

            rooms[room_id].gameStats = {}
            rooms[room_id].hostCardHTML = "";
            rooms[room_id].guestCardHTML = "";
            // host_ConfirmSelection = false;
            // guest_ConfirmSelection = false;
            // host_PlaceCard = false;
            // guest_PlaceCard = false;
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

        // // function rockPaperScissorV2(user1: Move, user2: Move): any {
        // //     const choices = ["rock", "paper", "scissor"];
        // //     const index1 = choices.indexOf(user1);
        // //     const index2 = choices.indexOf(user2);
        // //     if (index1 == index2) {
        // //         return { host: user1, guest: user2, winner: Result.Tie };
        // //     }
        // //     if (mod(index1 - index2, choices.length) < choices.length / 2) {
        // //         return { host: user1, guest: user2, winner: Result.Host };
        // //     } else {
        // //         return { host: user1, guest: user2, winner: Result.Guest };
        // //     }
        // // }
        // function mod(a: any, b: any) {
        //     const c = a % b;
        //     return c < 0 ? c + b : c;
        // }

    })
}


// export class IOController {
//     constructor(public io: SocketIO) { }
//     IO = async () => {
//         let IO = this.io

//         this.io.on("connection", function (socket) {
//             console.log(`\nSocket ID:`, socket.id, "[Connected]");
//             console.log(socket.request["session"]);

//             // DECLARE VARIABLES //
//             // Game Stats
//             let gameStats: any = {
//                 host_id: null,
//                 host_card: null,
//                 host_hp: null,
//                 host_atk: null,
//                 host_skill: null,
//                 guest_id: null,
//                 guest_card: null,
//                 guest_hp: null,
//                 guest_atk: null,
//                 guest_skill: null,
//                 action: null,
//                 damage: null,
//             };

//             // User info from session
//             let user = socket.request["session"].user

//             // Client say hello to server
//             socket.on("hello", (data: any) => {
//                 console.log("\n" + data["msg"]);
//             });

//             // Client request to create room (joinRoom Page)
//             // Assign room to Host
//             socket.on("createRoom", (new_room_id: any) => {
//                 console.log("\n", "New Room ID = ", new_room_id);
//                 socket.emit("assignRoom", new_room_id, { type: "host" });
//             });

//             // Guest join a room
//             socket.on("joinRoom", (room_id: any, player_type) => {
//                 socket.join(room_id);
//                 socket.emit("roomInfo", { msg: "You joined room" }, { room: room_id });
//                 socket.request["session"].room = { id: room_id, player_type: player_type }
//                 socket.request["session"].save()
//                 console.dir(socket.request["session"]);
//                 console.table(socket.request["session"]);
//                 if (!rooms[room_id]) {
//                     rooms[room_id] = {}
//                     rooms[room_id].gameStats = gameStats;
//                     rooms[room_id].gameStats.host_id = user.id;
//                     rooms[room_id].host_id = user.id
//                 } else {
//                     rooms[room_id].guest_id = user.id
//                     rooms[room_id].gameStats.guest_id = user.id;
//                 }

//                 // Return all Player ID from room
//                 (async function () {
//                     const room = await IO.in(room_id).fetchSockets();
//                     let count = 0;
//                     console.log(`\n[${room.length}] Player(s) in ${room_id}`);
//                     for (let id of room) {
//                         count++;
//                         console.log(`Room ID = ${room_id} / Player[${count}]: user_id = ${user.id} socket.id = ${id["id"]}`);
//                     }
//                 })();
//             });

//             // Page Loaded
//             socket.on("onPageLoad", (data: any) => {
//                 console.log("onPageLoad = ", data);
//             });

//             // Room Chat
//             socket.on("chat", (data: any) => {
//                 IO.in(socket.request["session"].room.id).emit("chat", data)
//             });

//             // Check Player Readiness for "Game"
//             socket.on("playerReadyToStartGame", () => {

//                 let room_id = socket.request["session"].room.id
//                 let room = rooms[room_id]

//                 console.log(`[User ID=${user.id}] Player <${room.player_type}> is ready.`);
//                 if (room.host_id === user.id) {
//                     room.hostReady = true;
//                     console.log("Host's room record = ", room)
//                 } else if (room.guest_id === user.id) {
//                     room.guestReady = true;
//                     console.log("Guest's room record = ", room)
//                 }
//                 if (!room.hostReady || !room.guestReady) {
//                     console.log(`Ready: Host=${room.hostReady} Guest=${room.guestReady}. Room ID=${room_id} <Initialize Game>`);
//                     return;
//                 } else if (room["gameInitialized"] === true || room["roundInitialized"] === true) {
//                     console.log(`Initialize: Game=${room["gameInitialized"]} Round=${room["roundInitialized"]}. Room ID=${room_id} <Initialize Game>`);
//                     return;
//                 } else {
//                     console.log(`Both players are ready. Room ID=${room_id} <Initialize Game>`);
//                     IO.in(room_id).emit("initial", "Initialize Game");
//                     room["gameInitialized"] = true;
//                     room["host_AllowSelectCard"] = true
//                     room["guest_AllowSelectCard"] = true
//                 }
//             });

//             // Select Card To Battle
//             socket.on("selectCard", (card_id: any, card_HTML: any) => {
//                 console.log("'selectCard' ", " card ID = ", card_id);

//                 let room_id = socket.request["session"].room.id
//                 let room = rooms[room_id]

//                 if (room["host_AllowSelectCard"] === false && room["guest_AllowSelectCard"] === false) {
//                     console.log("Cannot change card now.");
//                     return;
//                 } else {
//                     if (room.host_id === user.id && room["host_AllowSelectCard"] === true) {
//                         room["gameStats"].host_card = card_id;
//                         room["hostCardHTML"] = card_HTML;
//                         console.log(`Host selected card ID=${room["gameStats"].host_card}`)
//                         console.log(room["hostCardHTML"])
//                         socket.emit("selectCard", "Host", card_id, card_HTML)
//                     } else if (room.guest_id === user.id && room["guest_AllowSelectCard"] === true) {
//                         room["gameStats"].guest_card = card_id;
//                         room["guestCardHTML"] = card_HTML;
//                         console.log(`Guest selected card ID=${room["gameStats"].guest_card}`)
//                         console.log(room["guestCardHTML"])
//                         socket.emit("selectCard", "Guest", card_id, card_HTML)
//                     }
//                 }
//             });

//             socket.on("confirmCardSelection", async () => {

//                 let room_id = socket.request["session"].room.id
//                 let room = rooms[room_id]
//                 let hostCardID = room["gameStats"].host_card
//                 let guestCardID = room["gameStats"].guest_card

//                 let player_type = room.host_id === user.id ? "Host" : "Guest"

//                 console.log(`<${player_type}> Confirm Card Selection`);

//                 if (room["roundInitialized"] === true) {
//                     return;
//                 } else {
//                     if (room.host_id === user.id) {
//                         room.host_ConfirmSelection = true;
//                     } else if (room.guest_id === user.id) {
//                         room.guest_ConfirmSelection = true;
//                     }
//                     if (room.host_ConfirmSelection === true && room.guest_ConfirmSelection === true) {
//                         console.log("Host selected card id = ", hostCardID, " & Guest selected card id = ", guestCardID);

//                         room.roundInitialized = true;
//                         room.host_ConfirmSelection = true;
//                         room.guest_ConfirmSelection = true;
//                         room.host_AllowSelectCard = false;
//                         room.guest_AllowSelectCard = false

//                         // use card_id from globe
//                         const host_card = await gameController.io_Get_Card_Data(socket, hostCardID);
//                         const guest_card = await gameController.io_Get_Card_Data(socket, guestCardID);

//                         room["gameStats"] = {
//                             host_id: room.host_id,
//                             host_card: host_card["id"],
//                             host_hp: host_card["hp"],
//                             host_atk: host_card["atk"],
//                             host_skill: host_card["skill_id"],
//                             guest_id: room.guest_id,
//                             guest_card: guest_card["id"],
//                             guest_hp: guest_card["hp"],
//                             guest_atk: guest_card["atk"],
//                             guest_skill: guest_card["skill_id"],
//                             action: null,
//                             damage: null,
//                         };

//                         console.log(`Room[${room}]`)
//                         console.log(`Room's game stats:`)
//                         console.table(`${room["gameStats"]}`)

//                         // Place card to Battle Zone
//                         IO.in(room_id).emit("placeCard",
//                             "host", room["hostCardHTML"], host_card,
//                             "guest", room["guestCardHTML"], guest_card);
//                     }
//                 }
//             });


//             socket.on("reset", () => {
//                 console.log("Client request to reset game");

//                 let room_id = socket.request["session"].room.id

//                 resetGame(room_id);
//             });

//             // Both Players Placed Card in Battle Zone <Start Game>
//             socket.on("placeCard", (status) => {
//                 let room_id = socket.request["session"].room.id
//                 let room = rooms[room_id]

//                 if (room.host_id === user.id && status.success === true) {
//                     room.host_PlaceCard = true
//                     console.log("Received notification from <Host> finishes place card.")
//                 } else if (room.guest_id === user.id && status.success === true) {
//                     room.guest_PlaceCard = true
//                     console.log("Received notification from <Guest> finishes place card.")
//                 }
//                 if (room.host_PlaceCard === true && room.guest_PlaceCard == true) {
//                     startGame(room.hostReady, room.guestReady, room_id);
//                 }
//             });

//             // Check Player Readiness for "Next Round"
//             socket.on("nextRound", (type: string) => {

//                 let room_id = socket.request["session"].room.id
//                 let room = rooms[room_id]

//                 if (room.roundInitialized === true) {
//                     return;
//                 } else {
//                     console.log(`[${type}] is ready for next round.`);
//                     if (room.host_id === user.id) {
//                         room.host_ReadyNextRound = true;
//                     } else if (room.guest_id === user.id) {
//                         room.guest_ReadyNextRound = true;
//                     }
//                     if (!room.host_ReadyNextRound || !room.guest_ReadyNextRound) {
//                         return;
//                     } else {
//                         console.log("Both players are ready, game will start.");
//                         IO.in(room_id).emit("startGame", true);

//                         (async () => {
//                             await setTimeoutPromise(200).then(() => {
//                                 IO.in(room_id).emit("nextRound", "下回合將會係3秒後開始...");
//                             });
//                             await setTimeoutPromise(500).then(() => {
//                                 IO.in(room_id).emit("nextRound", "3");
//                             });
//                             await setTimeoutPromise(1000).then(() => {
//                                 IO.in(room_id).emit("nextRound", "2");
//                             });
//                             await setTimeoutPromise(1000).then(() => {
//                                 IO.in(room_id).emit("nextRound", "1");
//                             });
//                             await setTimeoutPromise(1000).then(() => {
//                                 IO.in(room_id).emit("nextRound", "開始倒數");
//                             });
//                             await setTimeoutPromise(500).then(() => {
//                                 startCountdownTimer();
//                             });
//                         })();
//                     }
//                 }
//             });

//             // Rock Paper Scissor (selection received from players)
//             socket.on("move", async (move: string) => {

//                 let room_id = socket.request["session"].room.id
//                 let room = rooms[room_id]
//                 let gameStats = room["gameStats"]

//                 console.log(`'move' <${room.player_type}> = "${move}`);
//                 if (room["host_ReadyNextRound"] === true && room["guest_ReadyNextRound"] === true) {
//                     if (room.player_type === "host") {
//                         room.host_Move = move;
//                     } else if (room.player_type === "guest") {
//                         room.guest_Move = move;
//                     }
//                     if (!room.host_Move || !room.guest_Move) {
//                         return;
//                     } else {
//                         // Both player choose a move, determine the winner
//                         stopCountdownTimer(room_id);
//                         const resultObject = rockPaperScissor(room.host_Move, room.guest_Move);
//                         IO.in(room_id).emit("result", resultObject);

//                         // Tie and rematch without confirmation
//                         if (resultObject["winner"] === "tie") {
//                             room.host_Move = null;
//                             room.guest_Move = null;
//                             IO.in(room_id).emit("startGame", true);

//                             (async () => {
//                                 await setTimeoutPromise(1500).then(() => {
//                                     IO.in(room_id).emit("nextRound", "下回合將會係3秒後開始...");
//                                 });
//                                 await setTimeoutPromise(500).then(() => {
//                                     IO.in(room_id).emit("nextRound", "3");
//                                 });
//                                 await setTimeoutPromise(1000).then(() => {
//                                     IO.in(room_id).emit("nextRound", "2");
//                                 });
//                                 await setTimeoutPromise(1000).then(() => {
//                                     IO.in(room_id).emit("nextRound", "1");
//                                 });
//                                 await setTimeoutPromise(1000).then(() => {
//                                     IO.in(room_id).emit("nextRound", "開始倒數");
//                                 });
//                                 await setTimeoutPromise(500).then(() => {
//                                     startCountdownTimer();
//                                 });
//                             })();
//                         } else {

//                             if (resultObject["winner"] === "host") {
//                                 gameStats["action"] = resultObject["winner"];
//                                 gameStats["guest_hp"] = gameStats["guest_hp"] - gameStats["host_atk"];
//                                 gameStats["damage"] = gameStats["host_atk"];
//                             } else if (resultObject["winner"] === "guest") {
//                                 gameStats["action"] = resultObject["winner"];
//                                 gameStats["host_hp"] = gameStats["host_hp"] - gameStats["guest_atk"];
//                                 gameStats["damage"] = gameStats["guest_atk"];
//                             }

//                             if (gameStats["host_hp"] > 0 && gameStats["guest_hp"] > 0) {

//                                 IO.in(room_id).emit("gameStats", gameStats);
//                                 room.host_Move = undefined;
//                                 room.guest_Move = undefined;
//                                 room.host_ReadyNextRound = false;
//                                 room.guest_ReadyNextRound = false;
//                                 room.roundInitialized = false;

//                             } else if (gameStats["host_hp"] <= 0) {
//                                 gameStats["host_hp"] = "陣亡"
//                                 gameStats["host_atk"] = "-"
//                                 IO.in(room_id).emit("gameStats", gameStats);

//                                 room.host_Move = undefined;
//                                 room.guest_Move = undefined;
//                                 room.host_ReadyNextRound = false;
//                                 room.guest_ReadyNextRound = false;
//                                 room.roundInitialized = false;
//                                 room.host_ConfirmSelection = false;
//                                 room.host_PlaceCard = false;

//                                 socket.emit("replaceCard", gameStats)

//                             } else if (gameStats["guest_hp"] <= 0) {
//                                 gameStats["guest_hp"] = "陣亡"
//                                 gameStats["guest_atk"] = "-"
//                                 socket.emit("gameStats", gameStats);
//                                 IO.in(room_id).emit("gameStats", gameStats);

//                                 room.host_Move = undefined;
//                                 room.guest_Move = undefined;
//                                 room.host_ReadyNextRound = false;
//                                 room.guest_ReadyNextRound = false;
//                                 room.roundInitialized = false;
//                                 room.guest_ConfirmSelection = false
//                                 room.guest_PlaceCard = false;
//                                 stopCountdownTimer(room_id)
//                                 socket.emit("replaceCard", gameStats)
//                             }
//                         }
//                     }
//                 }
//             });

//             socket.on("replaceCard", () => {
//             })

//             socket.on("disconnect", () => { })

//             // socket.disconnected


//             // Socket IO FUNCTION

//             // Send Start Game Notification & turn on Timer
//             function startGame(host_ready: boolean, guest_ready: boolean, room_id: any) {
//                 console.log("Room [", room_id, "] Ready Status: Host=", host_ready, " & ", "Guest=", guest_ready)

//                 if (host_ready === true && guest_ready === true) {
//                     IO.in(room_id).emit("startGame", true);

//                     (async () => {
//                         await setTimeoutPromise(200).then(() => {
//                             IO.in(room_id).emit("nextRound", "遊戲將會係3秒後開始...");
//                         });
//                         await setTimeoutPromise(500).then(() => {
//                             IO.in(room_id).emit("nextRound", "3");
//                         });
//                         await setTimeoutPromise(1000).then(() => {
//                             IO.in(room_id).emit("nextRound", "2");
//                         });
//                         await setTimeoutPromise(1000).then(() => {
//                             IO.in(room_id).emit("nextRound", "1");
//                         });
//                         await setTimeoutPromise(1000).then(() => {
//                             IO.in(room_id).emit("nextRound", "開始倒數");
//                         });
//                         await setTimeoutPromise(500).then(() => {
//                             startCountdownTimer();
//                         });
//                     })()

//                 } else {
//                 }
//             }

//             // Start Timer
//             async function startCountdownTimer() {
//                 await setTimeoutPromise(500).then(() => {
//                     socket.emit("startTimer", true)
//                         ;
//                     console.log("Start counting down 10s");
//                 });
//             }

//             // Stop Timer
//             function stopCountdownTimer(room_id: any) {
//                 // socket.emit("startGame", false)
//                 IO.in(room_id).emit("startTimer", false);
//                 IO.in(room_id).emit("startGame", false);
//             }

//             // Restart Timer with Delay (Promisify)
//             const setTimeoutPromise = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//             // Restart Timer with Delay (Original) Not in use
//             // function LongSetTimeoutPromise(ms: number) {
//             //   return new Promise(function (resolve) {
//             //     setTimeout(resolve, ms);
//             //   });
//             // }

//             // Reset Game & Game Stats
//             function resetGame(room_id: any) {
//                 IO.in(room_id).emit("resetGame", "Reset Game");
//                 // gameInitialized = false;
//                 // roundInitialized = false;
//                 // host_Move = undefined;
//                 // guest_Move = undefined;
//                 // hostReady = undefined;
//                 // guestReady = undefined;
//                 // host_ReadyNextRound = true;
//                 // guest_ReadyNextRound = true;
//                 // host_AllowSelectCard = true;
//                 // guest_AllowSelectCard = true;

//                 rooms[room_id].gameStats = {}
//                 rooms[room_id].hostCardHTML = "";
//                 rooms[room_id].guestCardHTML = "";
//                 // host_ConfirmSelection = false;
//                 // guest_ConfirmSelection = false;
//                 // host_PlaceCard = false;
//                 // guest_PlaceCard = false;
//             }

//             // Rock Paper Scissor
//             enum Move {
//                 Rock = "rock",
//                 Paper = "paper",
//                 Scissor = "scissor",
//             }
//             enum Result {
//                 Tie = "tie",
//                 Host = "host",
//                 Guest = "guest",
//             }

//             function rockPaperScissor(host_Move: Move, guest_Move: Move): any {
//                 if (host_Move === guest_Move) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Tie };
//                 } else if (host_Move === Move.Rock && guest_Move === Move.Scissor) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Host };
//                 } else if (host_Move === Move.Rock && guest_Move === Move.Paper) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Guest };
//                 } else if (host_Move === Move.Paper && guest_Move === Move.Scissor) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Guest };
//                 } else if (host_Move === Move.Paper && guest_Move === Move.Rock) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Host };
//                 } else if (host_Move === Move.Scissor && guest_Move === Move.Paper) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Host };
//                 } else if (host_Move === Move.Scissor && guest_Move === Move.Rock) {
//                     return { host: host_Move, guest: guest_Move, winner: Result.Guest };
//                 }
//             }

//             // // function rockPaperScissorV2(user1: Move, user2: Move): any {
//             // //     const choices = ["rock", "paper", "scissor"];
//             // //     const index1 = choices.indexOf(user1);
//             // //     const index2 = choices.indexOf(user2);
//             // //     if (index1 == index2) {
//             // //         return { host: user1, guest: user2, winner: Result.Tie };
//             // //     }
//             // //     if (mod(index1 - index2, choices.length) < choices.length / 2) {
//             // //         return { host: user1, guest: user2, winner: Result.Host };
//             // //     } else {
//             // //         return { host: user1, guest: user2, winner: Result.Guest };
//             // //     }
//             // // }
//             // function mod(a: any, b: any) {
//             //     const c = a % b;
//             //     return c < 0 ? c + b : c;
//             // }

//         })
//     }
// }