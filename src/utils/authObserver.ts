"use client";

import { useAuth } from "@/hooks/useAuth";

export function AuthObserver() {
  useAuth(); // just mounts the listener
  return null;
}
