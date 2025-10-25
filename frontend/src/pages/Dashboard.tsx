import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { RoleGate } from "../auth/guards";
import { useItems, useCategories, useAddItem, useUpdateItem, useDeleteItem } from "../hooks/useInventory";
import { ItemActions } from "../components/ItemActions";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Paper,
  Grid,
  Card,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { Item, Category } from '../types';

export default function Dashboard() {
  // Auth hooks
  const { user, logout } = useAuth();
  
  // State hooks
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Item>>({});
  
  // Query hooks
  const { 
    data: itemsResponse, 
    isLoading: isLoadingItems,
    error: itemsError 
  } = useItems();
  
  const { 
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    error: categoriesError 
  } = useCategories();
  
  // Mutation hooks
  const addItemMutation = useAddItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();
  
  // Derived state
  const items = itemsResponse?.results || [];
  const categories = categoriesResponse?.results || [];
  
  // Early returns for loading/error states
  if (isLoadingItems || isLoadingCategories) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        Loading inventory data...
      </Box>
    );
  }

  if (itemsError || categoriesError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {itemsError ? "Failed to load inventory items" : "Failed to load categories"}
        {(itemsError || categoriesError) instanceof Error && `: ${(itemsError || categoriesError)?.message}`}
      </Alert>
    );
  }

  // Handle different types of errors
  const error = itemsError 
    ? "Failed to load inventory items" 
    : categoriesError 
    ? "Failed to load categories"
    : addItemMutation.error 
    ? "Failed to add item" 
    : updateItemMutation.error 
    ? "Failed to update item"
    : deleteItemMutation.error 
    ? "Failed to delete item"
    : null;

  // Grid columns definition
  const columns: GridColDef[] = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 70,
      align: 'center',
      headerAlign: 'center'
    },
    { field: "name", headerName: "Name", width: 200 },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      align: 'right',
      headerAlign: 'right',
        renderCell: (params) => {
          const value = params.value;
          return typeof value === 'number' ? `$${value.toFixed(2)}` : value ?? '';
        },
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      valueGetter: (params) => params.value?.name || "Unknown",
    },
    { 
      field: "quantity", 
      headerName: "Quantity", 
      width: 180,
      headerAlign: 'right',
      align: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ 
          width: "100%", 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          gap: 2 
        }}>
          <Typography sx={{ minWidth: '40px', textAlign: 'right' }}>
            {params.value}
          </Typography>
          {params.value < params.row.low_stock_threshold && (
            <Chip
              icon={<WarningIcon />}
              label="Low Stock"
              color="warning"
              size="small"
              sx={{ 
                backgroundColor: 'rgba(237, 108, 2, 0.08)',
                border: '1px solid rgba(237, 108, 2, 0.2)'
              }}
            />
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <ItemActions 
          item={params.row} 
          onEdit={handleEdit} 
          onDelete={handleDelete}
        />
      ),
    },
  ];

  // Handlers
  const handleAdd = async () => {
    try {
      await addItemMutation.mutateAsync(newItem);
      setIsAddDialogOpen(false);
      setNewItem({});
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      await updateItemMutation.mutateAsync(selectedItem);
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItemMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
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
          <RoleGate min="admin">
            <ListItem>
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="User Management" />
            </ListItem>
          </RoleGate>
        </List>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <InventoryIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Inventory Management
            </Typography>
            <Chip
              label={`Role: ${user?.role}`}
              color="secondary"
              sx={{ mr: 2 }}
            />
            <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}
              sx={{ textTransform: 'none', fontWeight: 500 }}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Items</Typography>
                <Typography variant="h4">{items.length}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6">Low Stock Items</Typography>
                <Typography variant="h4">
                  {items.filter((item) => item.quantity < 10).length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6">Categories</Typography>
                <Typography variant="h4">{categories.length}</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Main Grid */}
          <Paper 
            sx={{ 
              width: "100%", 
              mb: 2,
              mx: 'auto',
              maxWidth: '1200px',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '& .MuiDataGrid-root': {
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderColor: 'transparent',
                  fontSize: '0.95rem'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#fcfcfc',
                  borderBottom: '1px solid #f0f0f0',
                  '& .MuiDataGrid-columnHeader': {
                    borderRight: 'none'
                  }
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer',
                  borderBottom: '1px solid #f5f5f5',
                  '&:nth-of-type(even)': {
                    backgroundColor: '#fcfcfc'
                  },
                  '&:hover': {
                    backgroundColor: '#f8f9ff'
                  }
                }
              }
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: "flex", 
              justifyContent: "space-between",
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6">Inventory Items</Typography>
              <RoleGate min="admin">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add Item
                </Button>
              </RoleGate>
            </Box>
            <Box sx={{ p: 2 }}>
              <DataGrid
                rows={items}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 25,
                    },
                  },
                  sorting: {
                    sortModel: [{ field: 'id', sort: 'desc' }],
                  },
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterValues: [],
                    },
                  },
                }}
                pageSizeOptions={[25, 50, 100]}
                checkboxSelection={false}
                disableRowSelectionOnClick
                autoHeight
                keepNonExistentRowsSelected
                loading={isLoadingItems || isLoadingCategories}
                getRowId={(row) => row.id}
                sx={{
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.95rem'
                  }
                }}
                slots={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={newItem.name || ""}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              value={newItem.quantity || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: parseInt(e.target.value) })
              }
            />
            <TextField
              margin="dense"
              label="Price"
              fullWidth
              value={newItem.price || ""}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Category"
              select
              fullWidth
              value={newItem.category || ""}
              onChange={(e) =>
                setNewItem({ ...newItem, category: parseInt(e.target.value) })
              }
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            {selectedItem && (
              <>
                <TextField
                  margin="dense"
                  label="Name"
                  fullWidth
                  value={selectedItem.name}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, name: e.target.value })
                  }
                  disabled={user?.role !== "admin"}
                />
                <TextField
                  margin="dense"
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={selectedItem.quantity}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Price"
                  fullWidth
                  value={selectedItem.price}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, price: e.target.value })
                  }
                  disabled={user?.role !== "admin"}
                />
                <TextField
                  margin="dense"
                  label="Category"
                  select
                  fullWidth
                  value={selectedItem.category}
                  onChange={(e) =>
                    setSelectedItem({
                      ...selectedItem,
                      category: parseInt(e.target.value),
                    })
                  }
                  SelectProps={{
                    native: true,
                  }}
                  disabled={user?.role !== "admin"}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </TextField>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
