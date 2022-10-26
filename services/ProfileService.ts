import { Knex } from "knex";

export class ProfileService {
  constructor(private knex: Knex) {}

  getPersonalInfo = async (id: number) => {
    const sqlInfo = await this.knex
      .select(
        "users.username",
        "users.email",
        "users.user_type",
        "users.avatar",
        "score_board.game_won",
        "game_played"
      )
      .from("users")
      .leftJoin("score_board", "users.id", "score_board.user_id")
      .where("users.id", id);
    return sqlInfo;
  };

  getPersonalCard = async (id: number) => {
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
      .where("users.id", id);
    return sqlCard;
  };
}
