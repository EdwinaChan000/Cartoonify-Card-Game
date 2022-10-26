import type { NextFunction, Request, Response } from "express";
import formidable from "formidable";
import { UserService } from "../services/UserService";
import { checkPassword, hashPassword } from "../utils/hash";

export class UserController {
  constructor(private service: UserService) {}
  login = async (req: Request, res: Response) => {
    const { email, psw } = req.body;
    if (!email || !psw) {
      res.redirect("/");
      return;
    }
    const users = await this.service.serviceLogin(email);
    const user = users[0];
    console.table(user)
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });

      return;
    }
    const match = await checkPassword(psw, user.password);
    if (user && match) {
      req.session["user"] = {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
      };
      req.session.save();
      return res.json({ success: true }); // To the protected page.
    } else {
      return res.json({ success: false });
    }
  };

  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const inputs = req!.form!;
    const inputInform = inputs.fields;
    const profile = (inputs.files.profile as formidable.File).newFilename;
    const nameResult = await this.service.serviceCheckUserName(inputInform.name as string);
    if (!nameResult) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exist, please login or try again" });
    }

    const emailResult = await this.service.serviceCheckUserEmail(inputInform.email as string);

    if (emailResult[0] !== undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exist, please login or try again" });
    } else {
      this.service.serviceSignUp(
        inputInform.name as string,
        inputInform.email as string,
        await hashPassword(inputInform.psw as string),
        profile as any as formidable.File
      );

      return res.status(200).json({ success: true, message: "Sign up Success! Welcome!" });
    }
  };
}
