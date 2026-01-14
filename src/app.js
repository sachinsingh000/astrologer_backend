import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";
import logger from "./config/logger.js";
import { connectDB } from "./config/db.js";
import loadExpress from "./loaders/express.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();
connectDB();

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());

loadExpress(app); // body parsers etc.
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;
