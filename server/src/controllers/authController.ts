import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import CreateHttpError from "http-errors";
import { JWT_SECRET } from "../config/env";


export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    if (!username || !email || !password) {
      throw CreateHttpError(400, "Alle Felder sind erforderlich");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw CreateHttpError(409, "Email wird bereits verwendet");
    }

    const newUser = await User.create({ username, email, password, role });

    res.status(201).json({
      message: "User erfolgreich registriert",
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (error) {
    console.error("DEBUG REGISTER ERROR:", error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) throw CreateHttpError(401, "Ungültige Zugangsdaten");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw CreateHttpError(401, "Ungültige Zugangsdaten");

    // ECHTES TRACKING: Zeitstempel bei jedem Login setzen
    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login erfolgreich",
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        lastLogin: user.lastLogin // mitsenden
      }
    });
  } catch (error) { next(error); }
};
// NEU: Heartbeat-Funktion, um den Online-Status aktuell zu halten
export const updateHeartbeat = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Aus dem Auth-Middleware Token
    if (!userId) return res.status(401).json({ message: "Nicht autorisiert" });

    await User.update(
      { lastLogin: new Date() }, 
      { where: { id: userId } }
    );

    res.json({ success: true, message: "Status aktualisiert" });
  } catch (error) {
    next(error);
  }
};