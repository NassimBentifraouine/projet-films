import bcrypt from "bcryptjs";
import { User } from "../types/user";

const adminPassword = bcrypt.hashSync("Admin123!", 10);

export const users: User[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@example.com",
    passwordHash: adminPassword,
    role: "admin",
    createdAt: new Date().toISOString(),
    watchlist: []
  }
];
