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

    console.log("🔍 Login Versuch für:", email);   

    if (!email || !password) {
      throw CreateHttpError(400, "Email und Passwort erforderlich");
    }

    const user = await User.findOne({ where: { email } });
    console.log("👤 User gefunden:", !!user);       

    if (!user) {
      console.log("❌ User nicht gefunden");
      throw CreateHttpError(401, "Ungültige Zugangsdaten");
    }

    console.log("📝 Gespeichertes Passwort (Hash):", user.password?.substring(0, 30) + "..."); 

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔑 bcrypt.compare Ergebnis:", isPasswordValid);   

    if (!isPasswordValid) {
      console.log("❌ Passwort falsch");
      throw CreateHttpError(401, "Ungültige Zugangsdaten");
    }

    const token = jwt.sign(
      { 
        id: user.id,        
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login erfolgreich",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};