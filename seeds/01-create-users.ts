import { Knex } from "knex";
import { hashPassword } from "../utils/hash";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

  // Inserts seed entries
  await knex("users").insert([
    {
      username: "Danny",
      email: "danny@email.com",
      password: await hashPassword("1234"),
      avatar: "icon1.jpg",
      user_type: "888",
      created: "2021-08-14 14:21:43",
      updated: "2021-08-14 14:21:43",
    },
  ]);

  await knex("users").insert([
    {
      username: "Edwina",
      email: "edwina@email.com",
      password: await hashPassword("1234"),
      avatar: "icon2.png",
      user_type: "888",
      created: "2021-08-14 14:21:43",
      updated: "2021-08-14 14:21:43",
    },
  ]);

  await knex("users").insert([
    {
      username: "Fish",
      email: "fish@email.com",
      password: await hashPassword("1234"),
      avatar: "fish-images.png",
      user_type: "888",
      created: "2021-08-14 14:21:43",
      updated: "2021-08-14 14:21:43",
    },
  ]);
}
