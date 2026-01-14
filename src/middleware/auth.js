import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import httpCodes from "../utils/httpCodes.js";

export function auth(req, res, next) {
  const token =
    req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;

  if (!token) return next(new ApiError(httpCodes.UNAUTHORIZED, "Unauthorized"));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    console.log("🔐 AUTH DECODED:", decoded); // <<< add this
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (err) {
    console.error("auth verify failed", err);
    return next(new ApiError(httpCodes.UNAUTHORIZED, "Invalid token"));
  }
}
