import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sms_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("sms_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser((prev) => ({ ...prev, ...data }));
      } catch {
        if (!cancelled) {
          localStorage.removeItem("sms_token");
          localStorage.removeItem("sms_user");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("sms_token", data.token);
    localStorage.setItem("sms_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    localStorage.setItem("sms_token", data.token);
    localStorage.setItem("sms_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
