import { Request, Response } from "express";

export const errorController = (req: Request, res: Response) => {
  res.render("404", { title: "404 not found", message: "404 Not Found." });
};
