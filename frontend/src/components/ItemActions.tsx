import React from 'react';
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cached as CachedIcon,
} from "@mui/icons-material";
import { RoleGate } from "../auth/guards";
import { Item } from '../types';

interface ItemActionsProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onAdjust?: (item: Item) => void;
}

export const ItemActions: React.FC<ItemActionsProps> = ({ item, onEdit, onDelete, onAdjust }) => {
  return (
    <Box>
      {/* Adjust button for managers and above */}
      <RoleGate min="manager">
        {onAdjust && (
          <Tooltip title="Adjust stock">
            <IconButton
              color="secondary"
              onClick={() => onAdjust(item)}
              size="small"
            >
              <CachedIcon />
            </IconButton>
          </Tooltip>
        )}
      </RoleGate>

      {/* Edit allowed only for admin */}
      <RoleGate min="admin">
        <IconButton
          color="primary"
          onClick={() => onEdit(item)}
          size="small"
        >
          <EditIcon />
        </IconButton>
      </RoleGate>

      {/* Delete allowed only for admin */}
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
  );
};