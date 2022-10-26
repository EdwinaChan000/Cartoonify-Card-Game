import type { Request, Response, NextFunction } from "express";

export const isLoggedInAPI = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session["user"]) {
    console.log("isLoggedInMiddleware - fail");
    res.redirect("/login.html");
    return;
  }

  // loginned in
  console.log("success case");
  next();
};
