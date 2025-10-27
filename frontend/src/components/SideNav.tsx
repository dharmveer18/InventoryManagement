import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard as DashboardIcon, Group as GroupIcon } from '@mui/icons-material';

export type SideNavProps = {
  open: boolean;
  onClose: () => void;
  userRole?: string | null;
};

const drawerWidth = 240;

export const SideNav: React.FC<SideNavProps> = ({ open, onClose, userRole }) => {
  const isAdmin = userRole === 'admin';

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        <ListItem>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        {isAdmin && (
          <ListItem>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="User Management" />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};

export default SideNav;
