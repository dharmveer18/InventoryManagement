import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { RoleGate } from "../auth/guards";
import { useDashboard } from "./dashboard/useDashboard";
import { InventoryTable } from "../components/InventoryTable";
import { SummaryCards } from "../components/SummaryCards";
import { Layout } from "./dashboard/Layout";
import { Box, Typography, Button, Alert, Paper, Stack, Tabs, Tab, MenuItem, Select, Table, TableHead, TableRow, TableCell, TableBody, FormControl, FormHelperText } from "@mui/material";
import { Add as AddIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import { Item } from '../types';
import { AddItemDialog } from '../components/AddItemDialog';
import { EditItemDialog } from '../components/EditItemDialog';
import BulkStockCsvDialog from '../components/BulkStockCsvDialog';
import { useUsersList, useSetUserRole, type AppUser } from '../hooks/useUsers';

// Users management panel component
function UsersManagementPanel() {
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
    <Box sx={{ mt: 2, p: 2 }}>
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
          {(data ?? []).filter((u: AppUser) => u.username !== 'admin.user').map((u: AppUser) => (
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
    </Box>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const {
    items,
    categories,
    isLoadingItems,
    isLoadingCategories,
    error,
    selectedItem,
    isAddDialogOpen,
    openAdd,
    closeAdd,
    submitAdd,
    isEditDialogOpen,
    openEdit,
    openAdjust,
    closeEdit,
    submitEdit,
    submitAdjust,
    editIntent,
    deleteItem,
  } = useDashboard();
  const [isBulkDialogOpen, setBulkDialogOpen] = useState(false);
  const location = useLocation();
  const [adminTab, setAdminTab] = useState(0);

  // Support deep-linking: /?add=1 opens the Add Item dialog
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === '1') {
      openAdd();
    }
  }, [location.search, openAdd]);

  if (isLoadingItems || isLoadingCategories) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>Loading inventory data...</Box>;
  }

  if (error) {
    //render the page with an inline error alert
  }

  // Unify flows: both Edit and Adjust buttons open the same dialog
  const handleEdit = (item: Item) => openEdit(item);
  const handleDelete = (id: number) => void deleteItem(id);

  return (
    <Layout userRole={user?.role} onLogout={logout}>
      <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <SummaryCards 
            itemsCount={items.length}
            lowStockCount={items.filter((i) => i.quantity < 10).length}
            categoriesCount={categories.length}
          />

          <RoleGate min="admin">
            <Paper sx={{ mb: 2 }}>
              <Tabs value={adminTab} onChange={(_e, v) => setAdminTab(v)}>
                <Tab label="Inventory" />
                <Tab label="User Management" />
              </Tabs>
            </Paper>
          </RoleGate>

          <Paper 
            sx={{ 
              width: '100%',
              mb: 2,
              mx: 'auto',
              maxWidth: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '& .MuiDataGrid-root': {
                border: 'none',
                '& .MuiDataGrid-cell': { borderColor: 'transparent', fontSize: '0.95rem' },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#fcfcfc',
                  borderBottom: '1px solid #f0f0f0',
                  '& .MuiDataGrid-columnHeader': { borderRight: 'none' },
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  '&:nth-of-type(even)': { backgroundColor: '#fcfcfc' },
                  '&:hover': { backgroundColor: '#f8f9ff' },
                },
              },
            }}
          >
            {adminTab === 0 && (
              <>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
                  <Typography variant="h6">Inventory Items</Typography>
                  <Stack direction="row" spacing={1}>
                    <RoleGate min="manager" max="manager">
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={() => setBulkDialogOpen(true)}
                      >
                        Bulk Upload
                      </Button>
                    </RoleGate>
                    <RoleGate min="admin">
                      <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Item</Button>
                    </RoleGate>
                  </Stack>
                </Box>
                <Box sx={{ p: 2 }}>
                  <InventoryTable 
                    items={items}
                    loading={isLoadingItems || isLoadingCategories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdjust={openAdjust}
                    userRole={user?.role}
                  />
                </Box>
              </>
            )}
            {adminTab === 1 && <UsersManagementPanel />}
          </Paper>
      </Box>

        <AddItemDialog
          open={isAddDialogOpen}
          onClose={closeAdd}
          categories={categories}
          onSubmit={submitAdd}
        />

        <EditItemDialog
          open={isEditDialogOpen}
          item={selectedItem}
          onClose={closeEdit}
          categories={categories}
          userRole={user?.role}
          onSubmit={submitEdit}
          onAdjust={submitAdjust}
          focusAdjust={editIntent === 'adjust'}
        />

        <BulkStockCsvDialog open={isBulkDialogOpen} onClose={() => setBulkDialogOpen(false)} />
    </Layout>
  );
}
