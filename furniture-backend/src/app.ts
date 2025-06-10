import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limiter } from "./middlewares/rateLimiter";
import i18next from "i18next";
import middleware from "i18next-http-middleware";
import Backend from "i18next-fs-backend";
import path from "path";
import cron from "node-cron";
import routes from "./routes/v1/index";
import { errorController } from "./controllers/view/errorController";
import {
  createOrUpdateSettingStatus,
  getSettingStatus,
} from "./services/settingService";

export const app = express();

// For using ejs
app.set("view engine", "ejs");
app.set("views", "src/views");

const whitelist = ["http://localhost:5173"];
const corsOptions = {
  origin: function (
    origin: any,
    callback: (error: Error | null, origin?: any) => void
  ) {
    //!origin means that allow requests with no origin (like mobile apps and cors requests ) // postman
    if (!origin) {
      return callback(null, true);
    }
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, //Allow cookies and authorization header
};

app
  .use(morgan("dev"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser())
  .use(cors(corsOptions))

  .use(helmet())
  .use(compression())
  .use(limiter);

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(
        process.cwd(),
        "src/locales",
        "{{lng}}",
        "{{ns}}.json"
      ),
    },
    detection: {
      order: ["querystring", "cookie"],
      cache: ["cookie"],

      fallbacklng: "en",
      preload: ["en", "mm"],
    },
  });

app.use(middleware.handle(i18next));

//Cross Origin Resource Policy / To show the photo from the localhost to localhosst
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

// To access static file
app.use(express.static("public"));
app.use(express.static("uploads")); // For image upload

// Routes
app.use(routes);
// ejs with server-side rendering

app.use(errorController);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error.";
  const errorCode = error.code || "Error_code";
  res.status(status).json({
    message,
    error: errorCode,
  });
  // next();
});

// Cron job example
cron.schedule("* * * 7 *", async () => {
  console.log("Running a task every minute");
  // Add your task here
  const setting = await getSettingStatus("maintenance");
  if (setting?.value === "true") {
    await createOrUpdateSettingStatus("maintenance", "false");
    console.log("Maintenance mode is off");
  }
});
