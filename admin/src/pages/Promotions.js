import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  DialogContentText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'public',
    discount: '',
    minPurchase: '',
    validFrom: dayjs().format('YYYY-MM-DD'),
    validUntil: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    usageLimit: 1,
    recipient: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const response = await axios.get(`${apiUrl}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      code: '',
      type: 'public',
      discount: '',
      minPurchase: '',
      validFrom: dayjs().format('YYYY-MM-DD'),
      validUntil: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      usageLimit: 1,
      recipient: '',
      description: '',
    });
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCreateCoupon = async () => {
    // Basic validation
    if (!formData.code || !formData.discount || !formData.validFrom || !formData.validUntil) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const payload = {
        ...formData,
        discount: Number(formData.discount),
        minPurchase: Number(formData.minPurchase),
        usageLimit: Number(formData.usageLimit),
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        recipient: formData.type === 'personal' ? formData.recipient : undefined,
      };
      await axios.post(`${apiUrl}/admin/coupons`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Coupon created!', severity: 'success' });
      handleCloseDialog();
      fetchCoupons();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to create coupon.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditId(coupon._id);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      minPurchase: coupon.minPurchase,
      validFrom: dayjs(coupon.validFrom).format('YYYY-MM-DD'),
      validUntil: dayjs(coupon.validUntil).format('YYYY-MM-DD'),
      usageLimit: coupon.usageLimit,
      recipient: coupon.recipient?._id || '',
      description: coupon.description || '',
    });
    setOpenDialog(true);
  };

  const handleUpdateCoupon = async () => {
    if (!formData.code || !formData.discount || !formData.validFrom || !formData.validUntil) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const payload = {
        ...formData,
        discount: Number(formData.discount),
        minPurchase: Number(formData.minPurchase),
        usageLimit: Number(formData.usageLimit),
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        recipient: formData.type === 'personal' ? formData.recipient : undefined,
      };
      await axios.patch(`${apiUrl}/admin/coupons/${editId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Coupon updated!', severity: 'success' });
      handleCloseDialog();
      fetchCoupons();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to update coupon.', severity: 'error' });
    } finally {
      setSubmitting(false);
      setEditId(null);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      await axios.delete(`${apiUrl}/admin/coupons/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Coupon deleted!', severity: 'success' });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchCoupons();
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to delete coupon.', severity: 'error' });
    }
  };
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
        Coupons Management
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleOpenDialog}>
          Create Coupon
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Code" name="code" value={formData.code} onChange={handleFormChange} required fullWidth disabled={!!editId} />
            <TextField select label="Type" name="type" value={formData.type} onChange={handleFormChange} fullWidth disabled={!!editId}>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="personal">Personal</MenuItem>
            </TextField>
            <TextField label="Discount (%)" name="discount" type="number" value={formData.discount} onChange={handleFormChange} required fullWidth />
            <TextField label="Min Purchase ($)" name="minPurchase" type="number" value={formData.minPurchase} onChange={handleFormChange} fullWidth />
            <TextField label="Valid From" name="validFrom" type="date" value={formData.validFrom} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="Valid Until" name="validUntil" type="date" value={formData.validUntil} onChange={handleFormChange} InputLabelProps={{ shrink: true }} required fullWidth />
            <TextField label="Usage Limit" name="usageLimit" type="number" value={formData.usageLimit} onChange={handleFormChange} fullWidth />
            {formData.type === 'personal' && (
              <TextField label="Recipient User ID" name="recipient" value={formData.recipient} onChange={handleFormChange} fullWidth />
            )}
            <TextField label="Description" name="description" value={formData.description} onChange={handleFormChange} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={editId ? handleUpdateCoupon : handleCreateCoupon} variant="contained" disabled={submitting}>{submitting ? (editId ? 'Updating...' : 'Creating...') : (editId ? 'Update' : 'Create')}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Coupon</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this coupon? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Min Purchase</TableCell>
                  <TableCell>Valid From</TableCell>
                  <TableCell>Valid Until</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell>{coupon.code}</TableCell>
                    <TableCell>{coupon.type}</TableCell>
                    <TableCell>{coupon.discount}%</TableCell>
                    <TableCell>${coupon.minPurchase}</TableCell>
                    <TableCell>{new Date(coupon.validFrom).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(coupon.validUntil).toLocaleDateString()}</TableCell>
                    <TableCell>{coupon.usedCount}/{coupon.usageLimit}</TableCell>
                    <TableCell>
                      <Chip label={coupon.status} color={coupon.status === 'active' ? 'success' : coupon.status === 'expired' ? 'error' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>{coupon.recipient?.email || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(coupon)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(coupon._id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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

export default Coupons;
