import express, { ErrorRequestHandler } from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { channelsRouter } from "./routes/channels.routes";
import cors from "cors";

const port = 3000;
export const app: Express = express();

app.use(cors());
app.use(express.json());
app.use('/channels', channelsRouter);

app.use((_req: Request, res: Response<{ error: string }>): void => {
  res.status(404).json({ error: "Not found" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
