import asyncHandler from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";
import httpCodes from "../utils/httpCodes.js";

/**
 * USER REGISTER
 */
export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);

  return res.status(httpCodes.CREATED).json({
    success: true,
    user,
  });
});

/**
 * USER LOGIN
 */
/**
 * UNIVERSAL LOGIN (users + astrologers)
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  const result = await authService.loginCombined({ email, phone, password });

  if (result.error) {
    return res
      .status(httpCodes.UNAUTHORIZED)
      .json({ success: false, message: result.error });
  }

  return res.json({
    success: true,
    ...result   // { user, astrologer?, token }
  });
});



/**
 * ASTROLOGER LOGIN
 */
export const loginAstrologer = asyncHandler(async (req, res) => {
  const result = await authService.loginAstrologer(req.body);

  if (result?.error) {
    return res
      .status(httpCodes.UNAUTHORIZED)
      .json({ success: false, message: result.error });
  }

  return res.json({
    success: true,
    ...result, // { user, astrologer, token }
  });
});


/**
 * ASTROLOGER REGISTRATION
 */
export const registerAstrologer = asyncHandler(async (req, res) => {
  const result = await authService.registerAstrologer(req.body);

  return res.status(httpCodes.CREATED).json({
    success: true,
    message: "Astrologer registered successfully. Pending approval.",
    ...result,
  });
});
