import { useCallback } from "react";
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  updateLoading,
  dismissToast,
  dismissAllToasts,
} from "../utils/toast";

export const useToast = () => {
  const success = useCallback((message) => {
    showSuccess(message);
  }, []);

  const error = useCallback((message) => {
    showError(message);
  }, []);

  const warning = useCallback((message) => {
    showWarning(message);
  }, []);

  const info = useCallback((message) => {
    showInfo(message);
  }, []);

  const loading = useCallback((message = "Loading...") => {
    return showLoading(message);
  }, []);

  const update = useCallback((toastId, message, type = "success") => {
    updateLoading(toastId, message, type);
  }, []);

  const dismiss = useCallback((toastId) => {
    dismissToast(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  return {
    success,
    error,
    warning,
    info,
    loading,
    update,
    dismiss,
    dismissAll,
  };
};
