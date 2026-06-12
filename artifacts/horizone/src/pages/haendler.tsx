import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Haendler() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/admin");
  }, [navigate]);
  return null;
}
