import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

const objectIdPattern = /^[a-f\d]{24}$/i;

export const validateTaskId = (
  _req: Request,
  res: Response,
  next: NextFunction,
  value: string,
): void => {
  if (!objectIdPattern.test(value)) {
    next(
      new AppError(
        "El id debe ser un ObjectId válido.",
        400,
        "INVALID_ID",
      ),
    );
    return;
  }

  res.locals.taskId = value;
  next();
};
