import type { Request, Response } from "express";

export const channelsHealth = (_req: Request, res: Response<{ status: string }>): void => {
    res.status(200).json({ status: "ok" });
}