import { Knex } from "knex";

export async function up(knex: Knex) {
  if (await knex.schema.hasTable("cards")) {
    await knex.schema.alterTable("cards", (table) => {
      table.dropColumn("user_id");
    });
  }
}

export async function down(knex: Knex) {
  if (await knex.schema.hasTable("cards")) {
    await knex.schema.alterTable("cards", (table) => {
      table.integer("user_id");
    });
  }
}
