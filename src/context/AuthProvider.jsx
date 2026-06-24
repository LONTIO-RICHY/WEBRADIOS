import { useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const is_admin = localStorage.getItem("is_admin") === "true";
    return (token && username) ? { token, username, is_admin } : null;
  });

  const login = (userData) => {
    localStorage.setItem("token", userData.access_token);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("is_admin", userData.is_admin);
    setUser({ 
        token: userData.access_token, 
        username: userData.username, 
        is_admin: userData.is_admin 
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("is_admin");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
