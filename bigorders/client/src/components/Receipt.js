import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const Receipt = ({ receipt }) => {
  if (!receipt) return null;

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Receipt - {receipt.orderName}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Restaurant: {receipt.restaurant.name}
      </Typography>
      
      <TableContainer>
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
                <strong>Total:</strong>
              </TableCell>
              <TableCell align="right">
                <strong>${receipt.total.toFixed(2)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'right' }}>
        Generated on: {new Date(receipt.createdAt).toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default Receipt;
