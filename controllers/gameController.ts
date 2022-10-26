import { GameService } from "../services/GameService";
console.log("{Game Controller} is running")

export class GameController {
    constructor(private gameService: GameService) { }

    // Get cards to start game

    getCards_Shuffle = async (socket: any) => {
        console.log("{getCards_Shuffle} --Game Controller Class--")

        try {
            const user = socket.request.session["user"]!;
            const deck = await this.gameService.getCardsFromDB(user.id)

            console.log("--Original Deck--")
            console.table(deck)

            let shuffleDeck = []
            for (let i = deck.length; i > 0; i--) {
                let shuffle = Math.floor(Math.random() * i)
                shuffleDeck.push(deck[shuffle])
                if (shuffle < 0) {
                    deck.shift()
                } else {
                    deck.splice(shuffle, 1)
                }
            }
            console.log("--Shuffled Deck--")
            console.table(shuffleDeck)


            return shuffleDeck
        } catch (err) {
            return new Error
        }
    }

    io_Game_Stats = async (socket: any) => {
        console.log("{io_Game_Stats} --Game Controller Class--")

        try {
            const user = socket.request["session"].user!
            const gameData_DB = await this.gameService.gameDataFromDB(user.id, user.room_id!)

            if (gameData_DB["host"].user_id === user.id) {

                let gameStats: any =
                {
                    room_id: "room-1",
                    host: { user_id: gameData_DB["host"].user_id, username: gameData_DB["host"].username, deck: gameData_DB["host"]?.deck, card: gameData_DB["host"]?.card, hp: gameData_DB["host"]?.hp, atk: gameData_DB["host"]?.atk, skill: gameData_DB["host"]?.skill },
                    guest: { user_id: gameData_DB["guest"].user_id, username: gameData_DB["guest"].username, deck: gameData_DB["guest"]?.deck, card: gameData_DB["guest"]?.card, hp: gameData_DB["guest"]?.hp, atk: gameData_DB["guest"]?.atk, skill: gameData_DB["host"]?.skill },
                    action: "",
                    round: gameData_DB["round"] + 1,
                    winner: ""
                }
                return gameStats

            } else if (gameData_DB["guest"].user_id === user.id) {
                let gameStats: any =
                {
                    room_id: "room-1",
                    host: { user_id: gameData_DB["host"].user_id, username: gameData_DB["host"].username, deck: gameData_DB["host"]?.deck, card: gameData_DB["host"]?.card, hp: gameData_DB["host"]?.hp, atk: gameData_DB["host"]?.atk, skill: gameData_DB["host"]?.skill },
                    guest: { user_id: gameData_DB["guest"].user_id, username: gameData_DB["guest"].username, deck: gameData_DB["guest"]?.deck, card: gameData_DB["guest"]?.card, hp: gameData_DB["guest"]?.hp, atk: gameData_DB["guest"]?.atk, skill: gameData_DB["host"]?.skill },
                    action: "",
                    round: gameData_DB["round"] + 1,
                    winner: ""
                }
                return gameStats

            } else { console.log("{io_Game_Stats} [else] ......") }
        } catch (err) {
            return { message: "{io_Game_Stats} Error !!!!!!!" };
        }
    }
    io_Get_Card_Data = async (socket: any, card_id: any) => {
        console.log("{io_Get_Card_Data} --Game Controller Class--")
        try {
            const cardData_DB = await this.gameService.cardDataFromDB(card_id)
            console.log("{io_Get_Card_Data} --Game Controller Class--")
            console.table(cardData_DB)

            return cardData_DB

        } catch (err) {
            return { message: "{io_Get_Card_Data} Error !!!!!!!" };
        }

    }
}
