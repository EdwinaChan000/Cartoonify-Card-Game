import { ProfileService } from "../services/ProfileService";
import type { Request, Response } from "express";

export class ProfileController {
  constructor(private service: ProfileService) {}

  getPersonalInfo = async (req: Request, res: Response) => {
    try {
      const userId = req.session["user"]!;
      const gotProfile = await this.service.getPersonalInfo(userId.id);
      res.json(gotProfile);
    } catch (err) {
      res.status(500).json({ message: `internal server error` });
    }
  };

  getPersonalCard = async (req: Request, res: Response) => {
    try {
      const userId = req.session["user"]!;
      const gotCard = await this.service.getPersonalCard(userId.id);
      res.json(gotCard);
    } catch (err) {
      res.status(500).json({ message: "internal server error" });
    }
  };
}
