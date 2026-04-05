import { verifyAccessToken } from "../common/jwt.js";
import { AppError } from "./errorHandler.js";

export const authMiddleware = (req, res, next) => {
  try {
    console.log("AuthMiddleware: Checking authentication");

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    console.log("AuthMiddleware: Token found, verifying...");

    // Verify token
    const decoded = verifyAccessToken(token);
    console.log("AuthMiddleware: Token verified, user:", decoded.userId);

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("AuthMiddleware: Authentication failed:", err.message);
    next(err);
  }
};

export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log("RoleMiddleware: Checking user role");

      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError("Insufficient permissions", 403);
      }

      console.log("RoleMiddleware: Role check passed");
      next();
    } catch (err) {
      console.error("RoleMiddleware: Authorization failed:", err.message);
      next(err);
    }
  };
};
