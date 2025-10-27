import React, { useState } from 'react';
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

export type AddItemDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: Partial<Item>) => Promise<void> | void;
  categories: Category[];
};

export const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onSubmit,
  categories,
}) => {
  const [draft, setDraft] = useState<Partial<Item>>({});

  const handleSubmit = async () => {
    await onSubmit(draft);
    setDraft({});
  };

  const selectedCategoryId = typeof draft.category === 'object' && draft.category ? draft.category.id : '';

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Item</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={draft.name || ''}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Quantity"
          type="number"
          fullWidth
          value={draft.quantity || ''}
          onChange={(e) => setDraft({ ...draft, quantity: parseInt(e.target.value, 10) })}
        />
        <TextField
          margin="dense"
          label="Price"
          type="number"
          fullWidth
          value={typeof draft.price === 'number' ? draft.price : ''}
          onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
        />
        <CategorySelect
          value={selectedCategoryId}
          options={categories}
          onChange={(id) => {
            if (id === '') {
              setDraft({ ...draft, category: undefined as any });
            } else {
              const cat = categories.find((c) => c.id === id) || null;
              setDraft({ ...draft, category: cat as any });
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemDialog;
