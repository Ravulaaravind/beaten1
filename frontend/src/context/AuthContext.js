import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Invalid user data");
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      // Fetch latest user profile after login
      let latestUser = user;
      try {
        const profileRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (profileRes.data && profileRes.data.data) {
          latestUser = profileRes.data.data;
        }
      } catch (profileErr) {
        // If profile fetch fails, fallback to login user object
        console.error("Failed to fetch latest user profile after login", profileErr);
      }
      localStorage.setItem("user", JSON.stringify(latestUser));
      setUser(latestUser);
      setLoading(false);
      return { ...response.data, data: { token, user: latestUser } };
    } catch (err) {
      console.log("Login error:", err);
      setError(err.response?.data?.message || "login failed");
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || "login failed",
      };
    }
  };

  // Login user (connects to backend)
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        userData
      );
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? err.response.data.errors.map((e) => e.message).join(" ")
          : "Registration failed");
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  // Logout user

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
  };

  // Update user profile (placeholder - no backend connection)
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for profile update logic
      console.log("Profile update data:", userData);
      const updatedUser = { ...user, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setLoading(false);
      return { success: true, message: "Profile updated (placeholder)" };
    } catch (err) {
      setError("Profile update failed");
      setLoading(false);
      throw err;
    }
  };

  // Change password (placeholder - no backend connection)
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for password change logic
      console.log("Password change data:", passwordData);
      setLoading(false);
      return { success: true, message: "Password changed (placeholder)" };
    } catch (err) {
      setError("Password change failed");
      setLoading(false);
      throw err;
    }
  };

  // Send OTP for login (placeholder - no backend connection)
  const sendOTP = async (emailOrPhone) => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for OTP sending logic
      console.log("Send OTP to:", emailOrPhone);
      setLoading(false);
      return { success: true, message: "OTP sent (placeholder)" };
    } catch (err) {
      setError("Failed to send OTP");
      setLoading(false);
      throw err;
    }
  };

  // Verify OTP and login (placeholder - no backend connection)
  const verifyOTP = async (emailOrPhone, otp) => {
    setLoading(true);
    setError(null);
    try {
      // Placeholder for OTP verification logic
      console.log("Verify OTP:", emailOrPhone, otp);
      const mockUser = { id: 1, name: emailOrPhone, email: emailOrPhone };
      const mockToken = "mock-token-" + Date.now();

      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      return { success: true, message: "OTP verified (placeholder)" };
    } catch (err) {
      setError("OTP verification failed");
      setLoading(false);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    sendOTP,
    verifyOTP,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
