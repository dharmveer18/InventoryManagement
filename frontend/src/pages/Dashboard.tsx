import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { RoleGate } from "../auth/guards";
import { useDashboard } from "./dashboard/useDashboard";
import { InventoryTable } from "../components/InventoryTable";
import { SummaryCards } from "../components/SummaryCards";
import { Layout } from "./dashboard/Layout";
import { Box, Typography, Button, Alert, Paper, Stack } from "@mui/material";
import { Add as AddIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import { Item } from '../types';
import { AddItemDialog } from '../components/AddItemDialog';
import { EditItemDialog } from '../components/EditItemDialog';
import BulkStockCsvDialog from '../components/BulkStockCsvDialog';

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

          <Paper 
            sx={{ 
              width: '70%',
              mb: 2,
              mx: 'auto',
              maxWidth: '70vw',
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
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6">Inventory Items</Typography>
              <Stack direction="row" spacing={1}>
                <RoleGate min="manager">
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
