import { toast } from "react-toastify";

// Toast configuration
export const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast
export const showSuccess = (message) => {
  toast.success(message, toastConfig);
};

// Error toast
export const showError = (message) => {
  toast.error(message, toastConfig);
};

// Warning toast
export const showWarning = (message) => {
  toast.warning(message, toastConfig);
};

// Info toast
export const showInfo = (message) => {
  toast.info(message, toastConfig);
};

// Loading toast
export const showLoading = (message = "Loading...") => {
  return toast.loading(message, {
    ...toastConfig,
    autoClose: false,
  });
};

// Update loading toast
export const updateLoading = (toastId, message, type = "success") => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
  });
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};
