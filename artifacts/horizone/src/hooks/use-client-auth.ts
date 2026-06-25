import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "horizone_client_token";
const USER_KEY = "horizone_client_user";

export interface ClientUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useClientAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<ClientUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const login = useCallback((newToken: string, newUser: ClientUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, isLoggedIn: !!token && !!user, login, logout };
}

export function getClientToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
