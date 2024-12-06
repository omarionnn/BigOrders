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
  Alert,
  Divider,
} from '@mui/material';

const Receipt = ({ receipt }) => {
  // Debug logging
  console.log('Receipt Component - Received receipt data:', receipt);

  // If no receipt is provided, show a message
  if (!receipt) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No receipt available
      </Alert>
    );
  }

  // Check if required properties exist
  if (!receipt.participants || !Array.isArray(receipt.participants)) {
    console.error('Invalid receipt data:', receipt);
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Invalid receipt data structure
      </Alert>
    );
  }

  // Safely process participant items
  const processParticipantItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      name: String(item?.name || 'Unnamed Item'),
      quantity: Number(item?.quantity || 1),
      price: Number(item?.price || 0),
      notes: String(item?.notes || '')
    }));
  };

  // Calculate total amount safely
  const totalAmount = receipt.participants.reduce((sum, p) => {
    const total = Number(p?.total) || 0;
    return sum + total;
  }, 0);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      {/* Order Details */}
      <Typography variant="h5" gutterBottom>
        Order Receipt
      </Typography>
      <Typography variant="subtitle1">
        Order Name: {String(receipt.order?.name || 'Unnamed Order')}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        PIN: {String(receipt.order?.pin || 'N/A')}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Restaurant Details */}
      <Typography variant="h6" gutterBottom>
        Restaurant Details
      </Typography>
      <Typography variant="body1">
        {String(receipt.restaurant?.name || 'Unknown Restaurant')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {String(receipt.restaurant?.cuisine || 'N/A')} • {String(receipt.restaurant?.address || 'N/A')}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Order Items */}
      <Typography variant="h6" gutterBottom>
        Order Items
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Participant</TableCell>
              <TableCell>Items</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipt.participants.map((participant, index) => {
              const items = processParticipantItems(participant.items);
              return (
                <TableRow key={`participant-${index}`}>
                  <TableCell>
                    <Typography variant="body1">
                      {String(participant.user?.name || 'Anonymous')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {String(participant.role || 'Participant')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {items.length > 0 ? (
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {items.map((item, itemIndex) => (
                          <li key={`item-${itemIndex}`}>
                            {item.name} x {item.quantity} (${(item.price * item.quantity).toFixed(2)})
                            {item.notes && (
                              <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                                ({item.notes})
                              </Typography>
                            )}
                          </li>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    ${Number(participant.total || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      {/* Order Summary */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        <Typography variant="body1">
          Total Amount: ${totalAmount.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Participants: {receipt.participants.length}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Items: {receipt.participants.reduce((sum, p) => sum + (Array.isArray(p.items) ? p.items.length : 0), 0)}
        </Typography>
      </Box>

      {/* Created By */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Created by: {String(receipt.creator?.name || 'Unknown')}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Generated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Receipt;
