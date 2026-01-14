import asyncHandler from "../utils/asyncHandler.js";
import * as remediesService from "../services/remedies.service.js";

export const list = asyncHandler(async (req, res) => {
  const remedies = await remediesService.listRemedies();
  res.json({ items: remedies });
});

export const myRemedies = asyncHandler(async (req, res) => {
  const remedies = await remediesService.listUserRemedies(req.user.id);
  res.json({ items: remedies });
});
