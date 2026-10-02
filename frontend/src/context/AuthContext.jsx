import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" stays true until we've checked whether a saved token is still valid
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  // On first load: if a token is saved, ask Django who it belongs to.
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api
      .get("/auth/me/")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token")) // token expired/invalid
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const login = async (username, password) =>
    saveSession((await api.post("/auth/login/", { username, password })).data);

  const register = async (username, email, password) =>
    saveSession((await api.post("/auth/register/", { username, email, password })).data);

  const logout = async () => {
    try {
      await api.post("/auth/logout/");
    } catch {
      /* even if the server call fails, log out locally */
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);
