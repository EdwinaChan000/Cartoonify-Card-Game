import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table) => {
        table.increments();
        table.string("username").unique().notNullable();
        table.string("email").unique().notNullable();
        table.string("password").notNullable();
        table.string("avatar");
        table.string("user_type");
        table.timestamp("created");
        table.timestamp("updated");
        table.timestamps(false, true);
    });
        
    await knex.schema.createTable("skills", (table) => {
        table.increments();
        table.string("skill_name");
        table.text("description");        
        table.timestamps(false, true);
    });

    await knex.schema.createTable("cards", (table) => {
        table.increments();
        table.string("card_name").notNullable();
        table.integer("skill_id").unsigned();
        table.foreign("skill_id").references("skills.id");
        table.string("attribute1");
        table.string("attribute2");
        table.string("image");
        table.string("gangs");
        table.integer("hp");
        table.integer("atk");
        table.float("cri");
        table.float("agi");
        table.string("frame_type");
        table.integer("user_id").unsigned();
        table.foreign("user_id").references("users.id");
        table.string("grade");
        table.timestamp("created");
        table.timestamp("updated");
        table.timestamps(false, true);
    });

    await knex.schema.createTable("decks", (table) => {
        table.increments();
        table.integer("card_id").unsigned();
        table.foreign("card_id").references("cards.id");
        table.integer("user_id").unsigned();
        table.foreign("user_id").references("users.id");
        table.timestamp("created");
        table.timestamp("updated");
        table.timestamps(false, true);
    });

    await knex.schema.createTable("rooms", (table) => {
        table.increments();
        table.integer("host_id").unsigned();
        table.foreign("host_id").references("users.id");
        table.integer("guest_id").unsigned();
        table.foreign("guest_id").references("users.id");
        table.integer("winner_id").unsigned();
        table.foreign("winner_id").references("users.id");
        table.string("room_type");
        table.timestamp("created");
        table.timestamp("updated");
        table.timestamps(false, true);
    });

    await knex.schema.createTable("records", (table) => {
        table.increments();
        table.integer("room_id").unsigned();
        table.foreign("room_id").references("rooms.id");
        table.integer("round_num");
        table.text("round_action");
        table.string("round_player");
        table.timestamps(false, true);
    });

    await knex.schema.createTable("score_board", (table) => {
        table.increments();
        table.integer("user_id").unsigned();
        table.foreign("user_id").references("users_id");
        table.integer("game_won");
        table.integer("game_played");
        table.timestamp("created");
        table.timestamp("updated");
        table.timestamps(false, true);
    });

    await knex.schema.createTable("friends_list", (table) => {
        table.increments();
        table.integer("user_id").unsigned();
        table.foreign("user_id").references("users_id");
        table.integer("friend_id").unsigned();
        table.foreign("friend_id").references("users_id");
        table.timestamp("created");
        table.timestamp("updated");
        table.timestamps(false, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("friends_list");
    await knex.schema.dropTableIfExists("score_board");
    await knex.schema.dropTableIfExists("records");
    await knex.schema.dropTableIfExists("rooms");
    await knex.schema.dropTableIfExists("decks");
    await knex.schema.dropTableIfExists("cards");
    await knex.schema.dropTableIfExists("skills");
    await knex.schema.dropTableIfExists("users");
}

