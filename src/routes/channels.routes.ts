import express from "express";
import type { Router } from "express";
import { channelsHealth } from "../controllers/channels.controller";

export const channelsRouter:Router = express.Router();

channelsRouter.get("/health", channelsHealth);
