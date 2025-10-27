import React from 'react';
import { Stack, TextField } from '@mui/material';

export type AdjustStockValue = {
  delta: number;
  note: string;
};

type AdjustStockFieldsProps = {
  value: AdjustStockValue;
  onChange: (v: AdjustStockValue) => void;
  autoFocus?: boolean;
};

export const AdjustStockFields: React.FC<AdjustStockFieldsProps> = ({ value, onChange, autoFocus }) => {
  return (
    <Stack spacing={2} mt={1}>
      <TextField
        label="Delta (e.g. +5 or -3)"
        type="number"
        value={value.delta}
        onChange={(e) => onChange({ ...value, delta: Number(e.target.value) })}
        autoFocus={autoFocus}
        fullWidth
      />
      <TextField
        label="Note (optional)"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        fullWidth
      />
    </Stack>
  );
};

export default AdjustStockFields;
