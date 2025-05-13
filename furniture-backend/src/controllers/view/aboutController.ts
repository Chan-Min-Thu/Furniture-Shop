import { Request, Response } from "express";

export const aboutController = (req: Request, res: Response) => {
  const users = [
    { name: "chan", age: 24 },
    { name: "Min", age: 25 },
  ];
  res.render("about", { title: "about Screen", users });
};
