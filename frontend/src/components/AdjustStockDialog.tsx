import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import type { Item } from '../types';
import { AdjustStockFields, AdjustStockValue } from './AdjustStockFields';

export type AdjustReason = 'manual' | 'csv' | 'adjustment' | 'init';

interface AdjustStockDialogProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onConfirm: (args: { id: number; delta: number; note?: string; reason?: AdjustReason }) => Promise<void> | void;
}

export const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({ open, item, onClose, onConfirm }) => {
  const [form, setForm] = useState<AdjustStockValue>({ delta: 0, note: '' });

  const handleSubmit = async () => {
    if (!item) return;
    await onConfirm({ id: item.id, delta: Number(form.delta), note: form.note, reason: 'manual' });
    setForm({ delta: 0, note: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adjust Stock {item ? `— ${item.name}` : ''}</DialogTitle>
      <DialogContent>
        <AdjustStockFields value={form} onChange={setForm} autoFocus />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!item}>Apply</Button>
      </DialogActions>
    </Dialog>
  );
};
