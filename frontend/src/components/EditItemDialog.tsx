import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Item, Category } from '../types';
import { CategorySelect } from './CategorySelect';
import { AdjustStockFields, AdjustStockValue } from './AdjustStockFields';
import type { AdjustReason } from './AdjustStockDialog';

export type EditItemDialogProps = {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onSubmit: (item: Item) => Promise<void> | void;
  onAdjust?: (args: { id: number; delta: number; note?: string; reason?: AdjustReason }) => Promise<void> | void;
  categories: Category[];
  userRole?: string;
  focusAdjust?: boolean;
};

export const EditItemDialog: React.FC<EditItemDialogProps> = ({
  open,
  item,
  onClose,
  onSubmit,
  categories,
  onAdjust,
  userRole,
  focusAdjust = false,
}) => {
  const [draft, setDraft] = useState<Item | null>(item);
  const [adjust, setAdjust] = useState<AdjustStockValue>({ delta: 0, note: '' });

  useEffect(() => {
    setDraft(item);
  }, [item]);

  const isAdmin = userRole === 'admin';
  const selectedCategoryId = draft ? draft.category.id : '';

  const handleSubmit = async () => {
    if (!draft) return;
    const isAdmin = userRole === 'admin';
    // If adjustment requested and handler provided, apply it first
    if (adjust.delta !== 0 && onAdjust) {
      await onAdjust({ id: draft.id, delta: Number(adjust.delta), note: adjust.note, reason: 'manual' });
      setAdjust({ delta: 0, note: '' });
    }
    // For admin, persist other fields; for manager, there are no editable fields
    if (isAdmin) {
      await onSubmit(draft);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        {draft && (
          <>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              disabled={!isAdmin}
              autoFocus={!focusAdjust}
            />
            <TextField
              margin="dense"
              label="Quantity (read-only)"
              type="number"
              fullWidth
              value={draft.quantity}
              disabled
              helperText="Use the Adjust section below to change quantity via a proper stock transaction."
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              disabled={!isAdmin}
            />
            <CategorySelect
              value={selectedCategoryId}
              options={categories}
              onChange={(id) => {
                if (id === '') return;
                const cat = categories.find((c) => c.id === id);
                if (cat) setDraft({ ...draft, category: cat });
              }}
              disabled={!isAdmin}
            />
            {(userRole === 'admin' || userRole === 'manager') && onAdjust && (
              <>
                {/* Inline stock adjustment section */}
                <div style={{ height: 8 }} />
                <AdjustStockFields value={adjust} onChange={setAdjust} autoFocus={focusAdjust} />
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {userRole === 'admin' ? 'Save' : 'Apply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditItemDialog;
