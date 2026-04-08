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

// authController.ts - login Funktion anpassen
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw CreateHttpError(401, "Ungültige Zugangsdaten");
    }

    await user.update({ lastLogin: new Date() });

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }   // kurzlebig
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }    // längerlebig
    );

    // httpOnly Cookie setzen
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage
    });

    res.json({
      message: "Login erfolgreich",
      accessToken,                    // nur Access Token zurückgeben
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) { 
    next(error); 
  }
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

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ message: "Kein Refresh Token" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { id: number };
    const user = await User.findByPk(decoded.id);

    if (!user) throw CreateHttpError(401, "User nicht gefunden");

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Optional: Refresh Token Rotation (neues Refresh Token ausstellen)
    const newRefreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie('refreshToken', newRefreshToken, { /* gleiche Optionen wie oben */ });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie('refreshToken');
    next(CreateHttpError(401, "Ungültiger Refresh Token"));
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: "Logout erfolgreich" });
};