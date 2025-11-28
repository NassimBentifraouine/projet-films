import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users } from "../data/users";
import { User, UserRole } from "../types/user";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "dev-super-secret-a-changer";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

// ========== Helpers ==========

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  watchlistCount: number;
};

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  watchlistCount: user.watchlist.length
});

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

const isStrongPassword = (password: string): boolean => {
  // Min 8 caractères, 1 maj, 1 min, 1 chiffre
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasLower && hasDigit;
};

const generateToken = (user: User): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// ========== Contrôleurs ==========

export const register = (req: Request, res: Response): void => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "Nom, email et mot de passe sont requis." });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Email invalide." });
    return;
  }

  if (!isStrongPassword(password)) {
    res.status(400).json({
      error:
        "Mot de passe trop faible. Min 8 caractères, avec majuscule, minuscule et chiffre."
    });
    return;
  }

  const existing = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    res.status(409).json({ error: "Un compte existe déjà avec cet email." });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const newUser: User = {
    id: (users.length + 1).toString(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "user",
    createdAt: new Date().toISOString(),
    watchlist: []
  };

  users.push(newUser);

  const token = generateToken(newUser);

  res.status(201).json({
    token,
    user: toPublicUser(newUser)
  });
};

export const login = (req: Request, res: Response): void => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe sont requis." });
    return;
  }

  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    res.status(401).json({ error: "Identifiants invalides." });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

  if (!isPasswordValid) {
    res.status(401).json({ error: "Identifiants invalides." });
    return;
  }

  const token = generateToken(user);

  res.status(200).json({
    token,
    user: toPublicUser(user)
  });
};

export const getMe = (req: Request, res: Response): void => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }

  const user = users.find((u) => u.id === authReq.user?.userId);

  if (!user) {
    res.status(404).json({ error: "Utilisateur non trouvé." });
    return;
  }

  res.status(200).json({
    user: toPublicUser(user)
  });
};
