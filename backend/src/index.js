import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config({
  path: "../.env",
});

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 8000");
});
