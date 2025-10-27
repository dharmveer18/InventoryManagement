import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { Category } from '../types';

export type CategorySelectProps = {
  value: number | '';
  options: Category[];
  onChange: (value: number | '') => void;
  disabled?: boolean;
  label?: string;
  fullWidth?: boolean;
  margin?: 'none' | 'dense' | 'normal';
};

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  options,
  onChange,
  disabled,
  label = 'Category',
  fullWidth = true,
  margin = 'dense',
}) => {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === '') onChange('');
        else onChange(parseInt(v, 10));
      }}
      disabled={disabled}
      fullWidth={fullWidth}
      margin={margin}
      SelectProps={{ native: false }}
    >
      <MenuItem value="">Select Category</MenuItem>
      {options.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>
          {cat.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CategorySelect;
