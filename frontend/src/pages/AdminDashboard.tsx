import React from 'react';
import { Layout } from './dashboard/Layout';
import { RoleGate } from '../auth/guards';
import { useAuth } from '../auth/AuthContext';
import { Box, Typography, Paper, Tabs, Tab, Stack, MenuItem, Select, Table, TableHead, TableRow, TableCell, TableBody, Button, FormControl, FormHelperText } from '@mui/material';
import { Link } from 'react-router-dom';
import { InventoryTable } from '../components/InventoryTable';
import { useUsersList, useSetUserRole, type AppUser } from '../hooks/useUsers';
import { useDashboard } from './dashboard/useDashboard';
import { AddItemDialog } from '../components/AddItemDialog';
import { EditItemDialog } from '../components/EditItemDialog';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = React.useState(0);

  return (
    <RoleGate min="admin">
      <Layout userRole={user?.role} onLogout={logout}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Admin</Typography>
          <Paper>
            <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
              <Tab label="Items" />
              <Tab label="Users" />
            </Tabs>
          </Paper>

          {tab === 0 && <ItemsAdminSection />}
          {tab === 1 && <UsersAdminSection />}
        </Box>
      </Layout>
    </RoleGate>
  );
}

function ItemsAdminSection() {
  const {
    items,
    categories,
    isLoadingItems,
    isLoadingCategories,
    selectedItem,
    isAddDialogOpen,
    openAdd,
    closeAdd,
    submitAdd,
    isEditDialogOpen,
    openEdit,
    closeEdit,
    openAdjust,
    submitEdit,
    submitAdjust,
    deleteItem,
  } = useDashboard();

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Manage Items</Typography>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={openAdd} variant="contained">Add New Item</Button>
      </Box>
      <InventoryTable
        items={items}
        loading={isLoadingItems || isLoadingCategories}
        onEdit={openEdit}
        onDelete={deleteItem}
          // Adjust opens the same Edit dialog but focuses the Adjust section
          onAdjust={openAdjust}
        userRole="admin"
      />
      <AddItemDialog open={isAddDialogOpen} onClose={closeAdd} categories={categories} onSubmit={submitAdd} />
      <EditItemDialog
        open={isEditDialogOpen}
        item={selectedItem}
        onClose={closeEdit}
        onSubmit={submitEdit}
        onAdjust={submitAdjust}
        categories={categories}
        userRole="admin"
        focusAdjust={true}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Tip: Use the Dashboard to add/edit items (admin-only actions already enabled there).
      </Typography>
    </Box>
  );
}

function UsersAdminSection() {
  const { data, isLoading } = useUsersList();
  const setRole = useSetUserRole();
  const [pendingRoles, setPendingRoles] = React.useState<Record<number, 'admin'|'manager'|'viewer'>>({});
  const [savingAll, setSavingAll] = React.useState(false);
  const [editing, setEditing] = React.useState<Record<number, boolean>>({});
  const hasChanges = Object.keys(pendingRoles).length > 0;

  const applyAll = async () => {
    if (!hasChanges) return;
    setSavingAll(true);
    try {
      // Apply all staged role changes sequentially to keep UX understandable
      for (const [idStr, role] of Object.entries(pendingRoles)) {
        const id = Number(idStr);
        await (setRole as any).mutateAsync({ id, role });
      }
      setPendingRoles({});
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Assign Roles</Typography>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Button
          variant="contained"
          disabled={!hasChanges || savingAll}
          onClick={applyAll}
          size="small"
        >
          {savingAll ? 'Assigning…' : 'Assign'}
        </Button>
      </Stack>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="center">Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data ?? []).map((u: AppUser) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {(() => {
                    const current = u.role ?? 'viewer';
                    const draft = pendingRoles[u.id] ?? current;
                    const changed = draft !== current;
                    const isEditing = !!editing[u.id];
                    // While saving all, disable selects; otherwise disabled when not editing
                    const disabled = savingAll || !isEditing;
                    const helper = savingAll && changed
                      ? 'Saving…'
                      : changed
                      ? 'Staged'
                      : isEditing
                      ? 'Editing'
                      : undefined;
                    return (
                      <FormControl size="small" disabled={disabled}>
                        <Select
                          size="small"
                          value={draft}
                          onChange={(e) => setPendingRoles((prev) => ({ ...prev, [u.id]: e.target.value as 'admin'|'manager'|'viewer' }))}
                          aria-label={`Set role for ${u.username}`}
                        >
                          <MenuItem value="admin">admin</MenuItem>
                          <MenuItem value="manager">manager</MenuItem>
                          <MenuItem value="viewer">viewer</MenuItem>
                        </Select>
                        {helper ? <FormHelperText>{helper}</FormHelperText> : null}
                      </FormControl>
                    );
                  })()}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditing((prev) => ({ ...prev, [u.id]: !prev[u.id] }))}
                  >
                    {editing[u.id] ? 'Done' : 'Edit'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!isLoading && (data ?? []).length === 0) && (
              <TableRow><TableCell colSpan={5}>No users.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
