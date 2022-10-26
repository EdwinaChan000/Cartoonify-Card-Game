import type { Request, Response } from "express";
import formidable from "formidable";
import { NewCardService } from "../services/NewCardService";
import { sendToPythonServer } from "../send-image";

let profileToDb: Object = {
  card_name: "",
  image: "",
  gangs: "",
  skill_id: "",
  attribute1: "",
  hp: "",
  atk: "",
  cri: "",
  agi: "",
  frame_type: "",
  grade: "",
  user_id: "",
};

export class NewCardController {
  constructor(private service: NewCardService) {}
  draw = async (req: Request, res: Response) => {
    const user_id = req.session["user"]!;
    const inputs = req.form!;
    const inputInform = inputs.fields;
    const profile = (inputs.files.files as formidable.File).newFilename;
    const style = inputInform["style"];

    let hp = 500;
    let atk = 200;

    function randomRank() {
      let result = {};

      let randomRanks = Math.ceil(Math.random() * 100);
      if (randomRanks > 95) {
        let factor = 1.5;
        hp = hp * factor;
        atk = atk * factor;

        result = { grade: "S", hp: hp, atk: atk };
        return result;
      } else if (randomRanks > 85) {
        let factor = 1.2;
        hp = hp * factor;
        atk = atk * factor;
        result = { grade: "A", hp: hp, atk: atk };
        return result;
      } else if (randomRanks > 65) {
        let factor = 1;
        hp = hp * factor;
        atk = atk * factor;
        result = { grade: "B", hp: hp, atk: atk };
        return result;
      } else {
        let factor = 0.8;
        hp = hp * factor;
        atk = atk * factor;
        result = { grade: "C", hp: hp, atk: atk };
        return result;
      }
    }

    function randomCardFrame() {
      let randomCardFrames = Math.floor(Math.random() * 3) + 1;
      if (randomCardFrames === 1) {
        return "fire";
      } else if (randomCardFrames === 2) {
        return "water";
      } else {
        return "wood";
      }
    }

    function randomSkill() {
      let randomSkill = Math.floor(Math.random() * 5) + 1;
      if (randomSkill === 1) {
        return 1;
      } else if (randomSkill === 2) {
        return 2;
      } else if (randomSkill === 3) {
        return 3;
      } else if (randomSkill === 4) {
        return 4;
      } else {
        return 5;
      }
    }

    const randomAttribute = randomCardFrame();
    const randomCardRank = randomRank();
    const randomCardSkill = randomSkill();
    const output_img = await sendToPythonServer(user_id.id, profile, style);

    profileToDb["card_name"] = inputInform["insertCardName"];
    profileToDb["image"] = output_img;
    profileToDb["gangs"] = inputInform["allGangs"];
    profileToDb["grade"] = randomCardRank["grade"];
    profileToDb["attribute1"] = randomAttribute;
    profileToDb["hp"] = randomCardRank["hp"];
    profileToDb["atk"] = randomCardRank["atk"];
    profileToDb["frame_type"] = randomAttribute;
    profileToDb["skill_id"] = randomCardSkill;
    profileToDb["cri"] = 0.1;
    profileToDb["agi"] = 0.1;
    profileToDb["agi"] = 0.1;
    profileToDb["user_id"] = user_id["id"];

    try {
      await this.service.insertCardFrom(profileToDb);
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "<draw> Internal server error" });
    }
  };

  getNewCard = async (req: Request, res: Response) => {
    try {
      const userId = req.session["user"]!;
      const gotCard = await this.service.getNewCard(userId.id);
      res.status(200).json(gotCard);
    } catch (err) {
      res.status(500).json({ message: "<getNewCard> internal server error" });
    }
  };
}
