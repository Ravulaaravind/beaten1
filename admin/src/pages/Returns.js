 import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Grid,
  Avatar,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'; // box/package icon
import axios from 'axios';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const statusIcons = {
  pending: <PendingIcon fontSize="small" />,
  approved: <CheckCircleIcon fontSize="small" />,
  rejected: <CancelIcon fontSize="small" />,
};

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [receivedMap, setReceivedMap] = useState({}); // Track received state per return
  const [receivedLoading, setReceivedLoading] = useState({}); // Track loading state per return

  const fetchReturns = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${apiUrl}/admin/returns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReturns(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch returns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleStatusChange = async (returnId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      await axios.patch(`${apiUrl}/admin/returns/${returnId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
      fetchReturns();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to update status.', severity: 'error' });
    }
  };

  // Handler for toggling received state
  const handleToggleReceived = async (returnId) => {
    setReceivedLoading((prev) => ({ ...prev, [returnId]: true }));
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
        await axios.patch(`${apiUrl}/admin/returns/${returnId}/received`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReceivedMap((prev) => ({ ...prev, [returnId]: true }));
      setSnackbar({ open: true, message: 'Marked as received!', severity: 'success' });
      fetchReturns(); // Optionally refresh data
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to mark as received.', severity: 'error' });
    } finally {
      setReceivedLoading((prev) => ({ ...prev, [returnId]: false }));
    }
  };

  // Sort returns by date descending (newest first)
  const sortedReturns = [...returns].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Filter returns by search
  const filteredReturns = sortedReturns.filter(ret => {
    const searchLower = search.toLowerCase();
    return (
      ret.user?.email?.toLowerCase().includes(searchLower) ||
      ret.orderId?.toLowerCase().includes(searchLower) ||
      ret.productId?.toLowerCase().includes(searchLower) ||
      ret.reason?.toLowerCase().includes(searchLower) ||
      (ret.status || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentReturnIcon sx={{ fontSize: 32, color: 'primary.main' }} /> All Returns
      </Typography>
      <Box sx={{ mb: 3, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by user, order, product, reason, status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredReturns.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <AssignmentReturnIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No Returns Found
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No return requests match your search.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReturns.map((ret) => {
            const isReceived = receivedMap[ret._id] || false;
            return (
              <Grid item xs={12} md={6} lg={4} key={ret._id}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      {ret.user?.email?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{ret.user?.email}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Order: <b>{ret.orderId}</b></Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Product: <b>{ret.productId}</b></Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>Phone: <b>{ret.user?.phone || 'N/A'}</b></Typography>
                    </Box>
                  </Stack>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Reason:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{ret.reason}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={statusIcons[ret.status || 'pending']}
                      label={ret.status?.charAt(0).toUpperCase() + ret.status?.slice(1) || 'Pending'}
                      color={statusColors[ret.status || 'pending']}
                      sx={{ fontWeight: 600, minWidth: 100 }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                      {ret.date ? new Date(ret.date).toLocaleString() : ''}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      disabled={ret.status === 'approved'}
                      onClick={() => handleStatusChange(ret._id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      fullWidth
                      startIcon={<CancelIcon />}
                      disabled={ret.status === 'rejected'}
                      onClick={() => handleStatusChange(ret._id, 'rejected')}
                    >
                      Reject
                    </Button>
                    {/* Enhanced Toggle Button: Only show if approved */}
                    {ret.status === 'approved' && (
                      <Tooltip title={isReceived ? 'Return Received' : 'Mark as Return Received'}>
                        <span>
                          <IconButton
                            onClick={() => handleToggleReceived(ret._id)}
                            disabled={isReceived || receivedLoading[ret._id]}
                            sx={{
                              border: `2px solid ${isReceived ? '#4caf50' : '#d32f2f'}`,
                              backgroundColor: isReceived ? '#e8f5e9' : '#ffebee',
                              color: isReceived ? '#388e3c' : '#d32f2f',
                              '&:hover': {
                                backgroundColor: isReceived ? '#c8e6c9' : '#ffcdd2',
                                boxShadow: 2,
                                transform: 'scale(1.1)',
                              },
                              ml: 1,
                            }}
                          >
                            {isReceived ? <CheckCircleIcon /> : <Inventory2OutlinedIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                  {/* Optionally, add a label below the button for extra clarity */}
                  {ret.status === 'approved' && (
                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                      <Chip
                        label={isReceived ? 'Return Received' : 'Not Received'}
                        color={isReceived ? 'success' : 'error'}
                        size="small"
                        icon={isReceived ? <CheckCircleIcon /> : <Inventory2OutlinedIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Returns; 