import { createContext, useContext } from "react";

// Auth context placeholder — will be implemented in the authentication phase
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Placeholder provider — wrap App with this when auth is implemented
export const AuthProvider = ({ children }) => {
  const value = {
    user: null,
    isAuthenticated: false,
    // login, logout, register will be added later
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
