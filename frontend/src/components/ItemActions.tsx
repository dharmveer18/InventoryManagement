import React from 'react';
import { Box, IconButton } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { RoleGate } from "../auth/guards";
import { Item } from '../types';

interface ItemActionsProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export const ItemActions: React.FC<ItemActionsProps> = ({ item, onEdit, onDelete }) => {
  return (
    <RoleGate min="manager">
      <Box>
        <IconButton
          color="primary"
          onClick={() => onEdit(item)}
          size="small"
        >
          <EditIcon />
        </IconButton>
        <RoleGate min="admin">
          <IconButton
            color="error"
            onClick={() => onDelete(item.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </RoleGate>
      </Box>
    </RoleGate>
  );
};