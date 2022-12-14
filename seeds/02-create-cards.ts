import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.raw("TRUNCATE TABLE cards, skills RESTART IDENTITY CASCADE");

  // Inserts seed entries

  const ids = await knex
    .insert([
      {
        skill_name: "咪郁!!",
        description: "郁邊個死邊個!! (禁用對方卡牌)",
      },
      {
        skill_name: "我行先!",
        description: "打你咪打你囉 (先手攻擊)",
      },
      {
        skill_name: "發癲",
        description: "同你死過 (一擊定勝負)",
      },
      {
        skill_name: "大大力",
        description: "一錘打扁你 (增加攻擊力)",
      },
      {
        skill_name: "死唔斷氣",
        description: "你打我唔死 (增加血量)",
      },
    ])
    .into("skills")
    .returning("id");

  for (const id of ids) {
    const skill_id = id.id;
    console.log("skill_id", skill_id);
    console.log("id", id.id);
  }
  await knex
    .insert([
      {
        card_name: "一蕉羞貍貔",
        skill_id: 1,
        attribute1: "fire",
        attribute2: "none",
        image: "一蕉羞貍貔.jpg",
        gangs: "html_logo.png",
        // hp: Math.floor(Math.random() * 400 + 100),
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "fire",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "中出即鯡",
        skill_id: 2,
        attribute1: "water",
        attribute2: "none",
        image: "中出即鯡.jpg",
        gangs: "css_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "water",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "珍系吹膠象",
        skill_id: 3,
        attribute1: "wood",
        attribute2: "none",
        image: "珍系吹膠象.png",
        gangs: "js_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "wood",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "麒麟怪",
        skill_id: 4,
        attribute1: "fire",
        attribute2: "none",
        image: "麒麟怪.jpg",
        gangs: "html_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "fire",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "花生魷",
        skill_id: 5,
        attribute1: "water",
        attribute2: "none",
        image: "花生魷.png",
        gangs: "css_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "water",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "縮縮北行鳥",
        skill_id: 1,
        attribute1: "wood",
        attribute2: "none",
        image: "縮縮北行鳥.jpg",
        gangs: "js_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "wood",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "雕娜猩",
        skill_id: 2,
        attribute1: "fire",
        attribute2: "none",
        image: "雕娜猩.jpg",
        gangs: "html_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "fire",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "真參鮫",
        skill_id: 3,
        attribute1: "water",
        attribute2: "none",
        image: "真參鮫.jpg",
        gangs: "css_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "water",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "金翅PK鳥",
        skill_id: 4,
        attribute1: "fire",
        attribute2: "none",
        image: "金翅PK鳥.jpg",
        gangs: "html_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "fire",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
      {
        card_name: "蝦蝦蝦",
        skill_id: 5,
        attribute1: "water",
        attribute2: "none",
        image: "蝦蝦蝦.png",
        gangs: "css_logo.png",
        hp: "500",
        atk: "200",
        cri: "0.1",
        agi: "0.1",
        frame_type: "water",
        grade: "B",
        created: "2021-08-14 14:21:43",
        updated: "2021-08-14 14:21:43",
      },
    ])
    .into("cards")
    .returning("*");
}
