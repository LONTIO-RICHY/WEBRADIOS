import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const is_admin = localStorage.getItem("is_admin") === "true";

    if (token && username) {
      setUser({ token, username, is_admin });
    }
  }, []);

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

export const useAuth = () => useContext(AuthContext);
