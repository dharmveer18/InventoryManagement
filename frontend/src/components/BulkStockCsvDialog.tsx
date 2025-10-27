import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import BulkStockCsvUpload from './BulkStockCsvUpload';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function BulkStockCsvDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Stock CSV Upload</DialogTitle>
      <DialogContent dividers>
        <BulkStockCsvUpload />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
