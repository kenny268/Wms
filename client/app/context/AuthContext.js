'use client';
// src/context/
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState("admin"); // Default to admin
  return <AuthContext.Provider value={{ role, setRole }}>{children}</AuthContext.Provider>;
};