import formidable from "formidable";
import { Knex } from "knex";

export class UserService {
  constructor(private knex: Knex) { }

  serviceLogin = async (email: string) => {
    const userEmail = this.knex("users").select("*").where("email", email);
    return userEmail;
  };

  serviceCheckUserName = async (name: string) => {
    const userName = this.knex("users").select("*").where("username", name);
    return userName;
  };
  serviceCheckUserEmail = async (email: string) => {
    const userEmail = this.knex("users").select("*").where("email", email);
    return userEmail;
  };

  serviceSignUp = async (name: string, email: string, psw: string, profile: formidable.File) => {
    const [user_id] = await this.knex("users")
      .insert([
        {
          username: name,
          email: email,
          password: psw,
          avatar: profile,
        },
      ])
      .returning("id");

    for (let i = 1; i < 11; i++) {
      await this.knex("decks").insert([
        {
          user_id: user_id.id,
          card_id: i,
        },
      ]);
    }
  };
}
