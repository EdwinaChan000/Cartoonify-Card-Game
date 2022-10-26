import express from "express";
import { Request, Response } from "express";

export const logoutRouter = express.Router();

logoutRouter.get("/", logout);

async function logout(req: Request, res: Response) {
  delete req.session["user"];
  res.status(200).json({ success: true, message: "success logout" });
}
