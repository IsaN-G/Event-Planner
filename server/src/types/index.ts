export type Role = "admin" | "user" | "organizer";

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  role: Role;
}

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};
