import { useState, useEffect } from "react";

export interface VisitorProfile {
  name: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = "horizone_visitor";

function loadProfile(): VisitorProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: VisitorProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function useVisitorProfile() {
  const [profile, setProfile] = useState<VisitorProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  function updateProfile(updates: Partial<VisitorProfile>) {
    const next = { name: "", email: "", phone: "", ...profile, ...updates };
    saveProfile(next);
    setProfile(next);
  }

  function clearProfile() {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }

  const hasName = loaded && !!profile?.name;

  return { profile, loaded, hasName, updateProfile, clearProfile };
}
