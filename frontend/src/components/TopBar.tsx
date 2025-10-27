import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Chip, Button } from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, Inventory as InventoryIcon } from '@mui/icons-material';

export type TopBarProps = {
  onToggleNav: () => void;
  userRole?: string | null;
  onLogout: () => void;
};

export const TopBar: React.FC<TopBarProps> = ({ onToggleNav, userRole, onLogout }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onToggleNav}>
          <MenuIcon />
        </IconButton>
        <InventoryIcon sx={{ mr: 2 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Inventory Management
        </Typography>
        <Chip label={`Role: ${userRole ?? 'unknown'}`} color="secondary" sx={{ mr: 2 }} />
        <Button color="inherit" onClick={onLogout} startIcon={<LogoutIcon />} sx={{ textTransform: 'none', fontWeight: 500 }}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
