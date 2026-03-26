import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();

// import { connectRedis } from "./config/redis_config.js";
const allowedOrigins = [process.env.CLIENT_URL || ""];

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

const port = process.env.PORT || 5000; // ✅ safe default

app.get("/", (req: Request, res: Response) => {
  res.json("hello from backend");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default app;
