import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries

  await knex.raw("TRUNCATE TABLE decks RESTART IDENTITY CASCADE");

  // Inserts seed entries
  await knex
    .insert([
      {
        card_id: "1",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "2",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "3",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "4",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "5",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "6",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "7",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "8",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "9",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "10",
        user_id: "1",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      /* ------------------------------------ 2 ----------------------------------- */
      {
        card_id: "1",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "2",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "3",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "4",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "5",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "6",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "7",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "8",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "9",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "10",
        user_id: "2",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      /* ------------------------------------ 3 ----------------------------------- */
      {
        card_id: "1",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "2",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "3",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "4",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "5",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "6",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "7",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "8",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "9",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_id: "10",
        user_id: "3",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
    ])
    .into("decks")
    .returning("id");
}

// INSERT INTO desks (card_id, user_id) VALUES ((SELECT id from cards where card_name ='NPC1'),(SELECT id from users where username ='fish'));
