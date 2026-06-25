import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface ClientJwtPayload {
  userId: number;
  email: string;
  name: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return `horizone-jwt-${pw}`;
  throw new Error("JWT_SECRET or ADMIN_PASSWORD must be set");
}

export function signClientToken(payload: ClientJwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyClientToken(token: string): ClientJwtPayload {
  return jwt.verify(token, getJwtSecret()) as ClientJwtPayload;
}

export function requireClientAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Anmeldung erforderlich" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyClientToken(token);
    (req as any).clientUser = payload;
    next();
  } catch {
    res.status(401).json({ error: "Ungültiger oder abgelaufener Token" });
  }
}
