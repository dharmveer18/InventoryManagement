import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Chip, Typography, Button } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import type { Item } from "../../types";
import { RoleGate } from "../../auth/guards";

type Handlers = {
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onAdjust: (item: Item) => void;
};

// MUI X DataGrid v8 passes value and row separately to valueGetter
// Signature: valueGetter?: (value: any, row: any, column: GridColDef, apiRef: GridApiCommunity) => any
const categoryNameGetter = (value: unknown, row: unknown) => {
  const v = value as { name?: string } | undefined;
  const r = row as Item | undefined;
  return r?.category?.name ?? v?.name ?? "Unknown";
};

export const columnsFactory = ({ onEdit, onDelete, onAdjust }: Handlers): GridColDef[] => [
  {
    field: "id",
    headerName: "ID",
    width: 70,
    align: "center",
    headerAlign: "center",
  },
  { field: "name", headerName: "Name", width: 200 },
  {
    field: "price",
    headerName: "Price",
    width: 50,
    align: "right",
    headerAlign: "right",
    renderCell: (params) => {
      const value = params.value as number | string | undefined;
      return typeof value === "number" ? `$${value.toFixed(2)}` : value ?? "";
    },
  },
  {
    field: "category",
    headerName: "Category",
    width: 100,
    valueGetter: categoryNameGetter,
  },
  {
    field: "quantity",
    headerName: "Quantity",
    width: 50,
    headerAlign: "right",
    align: "right",
    renderCell: (params: GridRenderCellParams) => {
      const value = params.value as number | undefined;
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 2,
            py: 0.5,
          }}
        >
          <Typography sx={{ minWidth: "40px", textAlign: "right", lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 80,
    align: "center",
    headerAlign: "center",
    sortable: true,
    filterable: true,
    renderCell: (params: GridRenderCellParams) => {
      const row = params.row as Item;
      const qty = typeof row.quantity === 'number' ? row.quantity : Number(row.quantity);
      const thr = typeof row.low_stock_threshold === 'number' ? row.low_stock_threshold : Number(row.low_stock_threshold);

      if (Number.isFinite(qty) && qty <= 0) {
        return (
          <Chip
            icon={<WarningIcon />}
            label="Out of stock"
            color="error"
            variant="filled"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      }
      if (Number.isFinite(qty) && Number.isFinite(thr) && qty < thr) {
        return (
          <Chip
            icon={<WarningIcon />}
            label="Low"
            color="warning"
            variant="filled"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        );
      }
      return null;
    },
    sortComparator: (v1, v2, param1, param2) => {
      // Custom sort: Out < Low < (none)
      const score = (row: any) => {
        const qty = Number(row.quantity);
        const thr = Number(row.low_stock_threshold);
        if (Number.isFinite(qty) && qty <= 0) return 0;
        if (Number.isFinite(qty) && Number.isFinite(thr) && qty < thr) return 1;
        return 2;
      };
      const s1 = score(param1.api.getRow(param1.id));
      const s2 = score(param2.api.getRow(param2.id));
      return s1 - s2;
    },
  },
  {
    field: "adjust",
    headerName: "Adjust Stock",
    width: 100,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams) => {
      const item = params.row as Item;
      return (
        <RoleGate min="manager">
          <Button
            size="small"
            variant="outlined"
            onClick={() => onAdjust(item)}
            sx={{ minWidth: 0, px: 0.6, py: 0.1, fontSize: '0.68rem', lineHeight: 1.2, textTransform: 'none' }}
          >
            Adjust
          </Button>
        </RoleGate>
      );
    },
  },
  {
    field: "edit",
    headerName: "Edit",
    width: 110,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams) => {
      const item = params.row as Item;
      return (
        <RoleGate min="admin">
          <Button
            size="small"
            variant="outlined"
            onClick={() => onEdit(item)}
            sx={{ minWidth: 0, px: 0.6, py: 0.1, fontSize: '0.68rem', lineHeight: 1.2, textTransform: 'none' }}
          >
            Edit
          </Button>
        </RoleGate>
      );
    },
  },
  {
    field: "delete",
    headerName: "Delete",
    width: 120,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    renderCell: (params: GridRenderCellParams) => {
      const item = params.row as Item;
      return (
        <RoleGate min="admin">
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => onDelete(item.id)}
            sx={{ minWidth: 0, px: 0.6, py: 0.1, fontSize: '0.68rem', lineHeight: 1.2, textTransform: 'none' }}
          >
            Delete
          </Button>
        </RoleGate>
      );
    },
  },
];
