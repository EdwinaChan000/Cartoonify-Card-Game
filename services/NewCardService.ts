import { Knex } from "knex";

export class NewCardService {
  constructor(private knex: Knex) {}
  insertCardFrom = async (profileToDb: any) => {
    //入落DB
    const cardId = await this.knex("cards")
      .insert([
        {
          card_name: profileToDb.card_name,
          gangs: profileToDb.gangs,
          image: profileToDb.image,
          grade: profileToDb.grade,
          attribute1: profileToDb.attribute1,
          hp: profileToDb.hp,
          atk: profileToDb.atk,
          frame_type: profileToDb.frame_type,
          skill_id: profileToDb.skill_id,
          cri: profileToDb.cri,
          agi: profileToDb.agi,
        },
      ])
      .returning("id");

    await this.knex("decks").insert({
      card_id: cardId[0].id,
      user_id: profileToDb.user_id,
    });
  };

  getNewCard = async (id: number) => {
    const sqlCard = await this.knex
      .select(
        "skills.skill_name",
        "skills.description",
        "cards.card_name",
        "cards.attribute1",
        "cards.image",
        "cards.gangs",
        "cards.hp",
        "cards.atk",
        "cards.grade",
        "cards.id"
      )
      .from("users")
      .innerJoin("decks", "users.id", "decks.user_id")
      .innerJoin("cards", "decks.card_id", "cards.id")
      .innerJoin("skills", "cards.skill_id", "skills.id")
      .where("users.id", id)
      .orderBy("cards.id");
    return sqlCard;
  };
}
