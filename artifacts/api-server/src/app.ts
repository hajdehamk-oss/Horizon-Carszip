import express from "express";
import cors from "cors";
import type { IncomingMessage, ServerResponse } from "http";
import pinoHttp from "pino-http";
import router from "./routes.js";
import { logger } from "./lib/logger.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = express() as any;

app.use(
  (pinoHttp as any)({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: unknown }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

export default app;
