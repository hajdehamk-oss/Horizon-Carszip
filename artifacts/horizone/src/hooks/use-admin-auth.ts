import { useState, useEffect } from "react";

const STORAGE_KEY = "horizone_admin_token";

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  async function login(password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setError(body.error ?? "Login fehlgeschlagen");
        return false;
      }
      const body = await res.json() as { token: string };
      localStorage.setItem(STORAGE_KEY, body.token);
      setToken(body.token);
      return true;
    } catch {
      setError("Verbindungsfehler");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }

  return { isAuthenticated, token, login, logout, isLoading, error };
}
