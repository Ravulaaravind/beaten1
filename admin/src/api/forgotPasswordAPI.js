import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Send admin forgot password OTP
export const sendAdminForgotPasswordOTP = async (email) => {
  try {
    const response = await api.post(
      `${API_BASE_URL}/forgot-password/admin/send-otp`,
      {
        email,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify admin forgot password OTP
export const verifyAdminForgotPasswordOTP = async (email, otp) => {
  try {
    const response = await api.post(
      `${API_BASE_URL}/forgot-password/admin/verify-otp`,
      {
        email,
        otp,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset admin password
export const resetAdminPassword = async (email, resetToken, newPassword) => {
  try {
    const response = await api.post("/forgot-password/admin/reset-password", {
      email,
      resetToken,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
