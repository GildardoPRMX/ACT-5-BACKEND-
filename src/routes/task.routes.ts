import { Router } from "express";

import {
  getTask,
  getTasks,
  patchTask,
  patchTaskComplete,
  postTask,
  removeTask,
} from "../controllers/task.controller.js";

export const taskRouter = Router();

taskRouter.get("/", getTasks);
taskRouter.get("/:id", getTask);
taskRouter.post("/", postTask);
taskRouter.patch("/:id/complete", patchTaskComplete);
taskRouter.patch("/:id", patchTask);
taskRouter.delete("/:id", removeTask);
