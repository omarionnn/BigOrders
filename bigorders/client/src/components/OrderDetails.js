import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Alert
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useOrder } from '../context/OrderContext';

const OrderDetails = ({ order }) => {
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const { generateReceipt } = useOrder();

  const handleGenerateReceipt = async () => {
    try {
      const result = await generateReceipt(order._id);
      if (result.success) {
        setReceipt(result.receipt);
        setError(null);
      } else {
        setError(result.error || 'Failed to generate receipt');
      }
    } catch (err) {
      setError('An error occurred while generating the receipt');
      console.error('Error:', err);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Order Details: {order.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={handleGenerateReceipt}
          >
            Generate Receipt
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {receipt && (
          <Collapse in={Boolean(receipt)}>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipt.userOrders.map((userOrder) => (
                    <TableRow key={userOrder.userId}>
                      <TableCell>{userOrder.userName}</TableCell>
                      <TableCell>
                        {userOrder.items.map((item, index) => (
                          <Box key={index}>
                            {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                          </Box>
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        ${userOrder.subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <Typography variant="subtitle1" component="span">
                        <strong>Total:</strong>
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" component="span">
                        <strong>${receipt.total.toFixed(2)}</strong>
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        )}
      </Paper>
    </Box>
  );
};

export default OrderDetails;
