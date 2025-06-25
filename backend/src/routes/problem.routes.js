import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
} from "../controllers/problem.controllers.js";

const problemRouter = express.Router();

problemRouter.post(
  "/create-problem",
  authMiddleware,
  checkAdmin,
  createProblem
);
problemRouter.get("/get-all-problems", authMiddleware, getAllProblems);
problemRouter.get("/get-problem/:id", authMiddleware, getProblemById);
problemRouter.put(
  "/update-problem/:id",
  authMiddleware,
  checkAdmin,
  updateProblem
);
problemRouter.delete(
  "/delete-problem/:id",
  authMiddleware,
  checkAdmin,
  deleteProblem
);

export default problemRouter;
