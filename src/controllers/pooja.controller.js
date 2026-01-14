import asyncHandler from "../utils/asyncHandler.js";
import * as poojaService from "../services/pooja.service.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ items: await poojaService.listPoojas() });
});
