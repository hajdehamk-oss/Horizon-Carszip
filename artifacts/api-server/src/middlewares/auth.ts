import type { Request, Response, NextFunction } from "express";

function getAdminToken(): string {
  const token = process.env.ADMIN_TOKEN;
  if (token) return token;
  const password = process.env.ADMIN_PASSWORD;
  if (password) return `horizone-${Buffer.from(password).toString("base64url")}`;
  throw new Error("ADMIN_PASSWORD or ADMIN_TOKEN environment variable must be set");
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = authHeader.slice(7);
  let expected: string;
  try {
    expected = getAdminToken();
  } catch {
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }
  if (token !== expected) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
