import { Knex } from "knex";

console.log("{Game Service} is running");

export class GameService {
  constructor(private knex: Knex) { }

  getCardsFromDB = async (user_id: number) => {
    console.log("{getCardsFromDB}--Game Service Class--");

    const cardsDataArray = await this.knex
      .select(
        "cards.id",
        "cards.card_name",
        "cards.gangs",
        "cards.attribute1",
        "cards.grade",
        "cards.hp",
        "cards.atk",
        "skills.skill_name",
        "skills.description",
        "cards.image"
      )
      .from("users")
      .innerJoin("decks", "users.id", "decks.user_id")
      .innerJoin("cards", "decks.card_id", "cards.id")
      .innerJoin("skills", "cards.skill_id", "skills.id")
      .where("users.id", user_id);
    return cardsDataArray;
  };

  saveShuffleDeck = async (room_id: string | undefined, user_id: number, deck: Object[]) => {
    console.log({ room: room_id, user_id: user_id, deck: deck });
    console.log("{saveShuffleDeck} --Game Service Class--");

    // Save shuffled deck to room_id the user had joined

    return { success: true };
  };

  gameInitialDataFromDB = async (user_id: number, room_id: any) => {
    console.log("{gameInitialDataFromDB} --Game Service Class--");

    let gameStats = {
      room_id: "room-1", //room_id
      host: { user_id: 0, username: "host", card: null, hp: 0, atk: null, skill: "" },
      guest: { user_id: 1, username: "guest", card: null, hp: 0, atk: null, skill: "" },
      action: "",
      round: "",
      winner: "",
    };

    console.log(gameStats);

    return gameStats;
  };

  gameDataFromDB = async (user_id: any, room_id: any) => {
    console.log("{gameDataFromDB} --Game Service Class--");

    // Mock Up Data....
    let gameStats = {
      room_id: "room-1", //room_id
      host: { user_id: 0, username: "host", deck: null, card: null, hp: 0, atk: null, skill: "" },
      guest: { user_id: 1, username: "guest", deck: null, card: null, hp: 0, atk: null, skill: "" },
      action: null,
      round: 90,
      winner: "",
    };

    return gameStats;
  };

  cardDataFromDB = async (card_id: any) => {
    console.log("{cardDataFromDB} --Game Service Class--");
    console.log("Card ID = ", card_id, "{cardDataFromDB} --Game Service Class--");

    const cardData = await this.knex("cards")
      .select("id", "gangs", "hp", "atk", "skill_id", "attribute1")
      .where("id", card_id);

    console.table(cardData[0]);

    return cardData[0];
  };
}
