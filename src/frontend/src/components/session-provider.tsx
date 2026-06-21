"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/lib/session-storage";
import type { AuthResponse, SessionUser } from "@/types/api";

type SessionContextValue = {
  isReady: boolean;
  token: string | null;
  user: SessionUser | null;
  setSession: (session: AuthResponse) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const session = readStoredSession();

    if (session) {
      setToken(session.token);
      setUser(session.user);
    }

    setIsReady(true);
  }, []);

  const setSession = (session: AuthResponse) => {
    writeStoredSession(session);
    setToken(session.token);
    setUser(session.user);
  };

  const signOut = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  return (
    <SessionContext.Provider
      value={{
        isReady,
        token,
        user,
        setSession,
        signOut,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}
