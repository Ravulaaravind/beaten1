import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../api/adminAPI";
import { showError, showSuccess, showWarning } from "../utils/toast";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem("admin_token");
          const errorMessage = err.message || "Authentication failed";
          setError(errorMessage);
          showWarning("Session expired. Please login again.");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      if (res.data.token) {
        localStorage.setItem("admin_token", res.data.token);
        setUser(res.data);
        setError(null);
        showSuccess("Login successful! Welcome back.");
        return res.data;
      } else {
        const errorMessage = "No token received from server";
        setError(errorMessage);
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.data.token) {
        // For registration, we don't automatically log in the user
        // They need to login separately
        setError(null);
        showSuccess("Registration successful! You can now login.");
        return res.data;
      } else {
        const errorMessage = "Registration completed but no token received";
        setError(errorMessage);
        showWarning(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      showError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      showSuccess("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      showWarning("Logout completed (some cleanup may have failed)");
    } finally {
      localStorage.removeItem("admin_token");
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
