import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, UserPayload } from "../types/auth";
import CreateHttpError from "http-errors";
import { JWT_SECRET } from "../config/env";

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(CreateHttpError(401, "Nicht autorisiert, kein Token vorhanden"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    // FORCE: id immer als String speichern
    const safeId = String(decoded.id);

    req.user = {
      id: safeId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    console.log(`[Auth] Token decodiert - userId als String: "${safeId}"`);

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    next(CreateHttpError(401, "Token ungültig oder abgelaufen"));
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Zugriff verweigert: Nur Administratoren haben hier Zutritt." 
    });
  }
};