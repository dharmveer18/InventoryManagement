import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Button,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

export type LayoutProps = {
  userRole?: string;
  onLogout: () => void;
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ userRole, onLogout, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Side Navigation */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
        }}
      >
        <List>
          <ListItem>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          {userRole === 'admin' && (
            <ListItem>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="User Management" />
            </ListItem>
          )}
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top Bar */}
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
            <InventoryIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Inventory Management
            </Typography>
            <Chip label={`Role: ${userRole ?? 'unknown'}`} color="secondary" sx={{ mr: 2 }} />
            <Button
              color="inherit"
              onClick={onLogout}
              startIcon={<LogoutIcon />}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Page-specific content */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
