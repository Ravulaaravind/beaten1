import axios from "axios";
import {
  API_ENDPOINTS,
  buildApiUrl,
  handleApiResponse,
  handleApiError,
} from "../utils/api";

// Create axios instance
const api = axios.create({
  baseURL: buildApiUrl(""),
  headers: {
    "Content-Type": "application/json",
  },
});

// Send forgot password OTP
export const sendForgotPasswordOTP = async (email) => {
  try {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD_SEND_OTP, {
      email,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Verify forgot password OTP
export const verifyForgotPasswordOTP = async (email, otp) => {
  try {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP, {
      email,
      otp,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Reset password
export const resetPassword = async (email, resetToken, newPassword) => {
  try {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD_RESET, {
      email,
      resetToken,
      newPassword,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Send OTP for login (email or phone)
export const sendOtpLogin = async ({ email, phone }) => {
  try {
    const response = await api.post(API_ENDPOINTS.SEND_OTP_LOGIN, {
      email,
      phone,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Verify OTP for login (email or phone)
export const verifyOtpLogin = async ({ email, phone, otp }) => {
  try {
    const response = await api.post(API_ENDPOINTS.VERIFY_OTP_LOGIN, {
      email,
      phone,
      otp,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
