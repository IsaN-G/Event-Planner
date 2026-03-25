import { Request } from "express";
import { JwtPayload as jsonwebtokenPayload } from "jsonwebtoken";

export interface UserPayload extends jsonwebtokenPayload {
  id: number;     
  username: string;
  email: string;
  role: "admin" | "user" | "organizer";
}
export interface AuthRequest extends Request {
  user?: UserPayload;
}