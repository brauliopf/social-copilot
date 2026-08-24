import express from "express";
import type { Router } from "express";
import { queryModel } from "../controllers/models.controller";

export const modelsRouter: Router = express.Router();

modelsRouter.post("/query", queryModel);
