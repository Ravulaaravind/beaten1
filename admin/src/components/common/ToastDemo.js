import React from "react";
import { Box, Button, Typography, Paper, Grid } from "@mui/material";
import { useToast } from "../../hooks/useToast";

function ToastDemo() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("This is a success message!");
  };

  const handleError = () => {
    toast.error("This is an error message!");
  };

  const handleWarning = () => {
    toast.warning("This is a warning message!");
  };

  const handleInfo = () => {
    toast.info("This is an info message!");
  };

  const handleLoading = () => {
    const loadingId = toast.loading("Processing...");
    setTimeout(() => {
      toast.update(loadingId, "Operation completed successfully!", "success");
    }, 3000);
  };

  const handleDismissAll = () => {
    toast.dismissAll();
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Toast Notifications Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click the buttons below to test different types of toast notifications
      </Typography>

      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="success"
            onClick={handleSuccess}
            size="small"
          >
            Success Toast
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="error"
            onClick={handleError}
            size="small"
          >
            Error Toast
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="warning"
            onClick={handleWarning}
            size="small"
          >
            Warning Toast
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="info"
            onClick={handleInfo}
            size="small"
          >
            Info Toast
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={handleLoading} size="small">
            Loading Toast
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDismissAll}
            size="small"
          >
            Dismiss All
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ToastDemo;
