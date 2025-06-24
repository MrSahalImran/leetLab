import express from "express";
import {
  check,
  login,
  logout,
  register,
} from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/check", check);

export default authRouter;
