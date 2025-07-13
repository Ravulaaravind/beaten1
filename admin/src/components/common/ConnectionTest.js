import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import { healthCheck } from "../../api/adminAPI";
import { showError, showSuccess, showWarning } from "../../utils/toast";

function ConnectionTest() {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    setStatus("checking");
    setError("");

    try {
      const response = await healthCheck();
      setStatus("connected");
      setLastCheck(new Date().toLocaleTimeString());
      showSuccess("Backend connection established successfully");
    } catch (err) {
      setStatus("error");
      setError(err.message);
      setLastCheck(new Date().toLocaleTimeString());
      showError(`Connection failed: ${err.message}`);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "success";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected to Backend API";
      case "error":
        return "Connection Failed";
      default:
        return "Checking Connection...";
    }
  };

  return (
    <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Backend Connection Status
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        {status === "checking" && <CircularProgress size={20} />}
        <Alert severity={getStatusColor()} sx={{ flex: 1 }}>
          {getStatusText()}
        </Alert>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error}
        </Alert>
      )}

      {lastCheck && (
        <Typography variant="body2" color="text.secondary">
          Last checked: {lastCheck}
        </Typography>
      )}

      <Button
        variant="outlined"
        onClick={checkConnection}
        disabled={status === "checking"}
        sx={{ mt: 1 }}
      >
        Test Connection
      </Button>
    </Box>
  );
}

export default ConnectionTest;
