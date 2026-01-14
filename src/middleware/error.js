import ApiError from "../utils/ApiError.js";
import httpCodes from "../utils/httpCodes.js";

export function notFound(req, res, next) {
  next(new ApiError(httpCodes.NOT_FOUND, "Route not found"));
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
}
