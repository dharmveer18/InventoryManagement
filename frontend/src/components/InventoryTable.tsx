import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { columnsFactory } from "../pages/dashboard/columns";
import { Item } from "../types";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { useGridApiContext, useGridSelector, gridPageCountSelector, gridPaginationModelSelector } from "@mui/x-data-grid";

type Props = {
  items: Item[];
  loading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onAdjust: (item: Item) => void;
  userRole?: string;
};

// Custom footer showing "Showing X of Y Pages" with page size dropdown
function CustomFooter() {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const currentPage = paginationModel.page + 1;

  const handlePageSizeChange = (event: any) => {
    apiRef.current.setPageSize(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1.5,
        borderTop: '1px solid #e0e0e0',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">Rows per page:</Typography>
        <Select
          value={paginationModel.pageSize}
          onChange={handlePageSizeChange}
          size="small"
          sx={{ width: 70 }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </Box>
      <Typography variant="body2">
        Showing {currentPage} of {pageCount} Pages
      </Typography>
    </Box>
  );
}

export function InventoryTable({ items, loading, onEdit, onDelete, onAdjust }: Props) {
  const columns = React.useMemo(() => columnsFactory({ onEdit, onDelete, onAdjust }), [onEdit, onDelete, onAdjust]);

  return (
    <DataGrid
      rows={items}
      columns={columns}
      density="compact"
      rowHeight={42}
      columnHeaderHeight={44}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 25,
            page: 0,
          },
        },
        sorting: {
          sortModel: [{ field: "id", sort: "desc" }],
        },
        filter: {
          filterModel: {
            items: [],
            quickFilterValues: [],
          },
        },
      }}
      pageSizeOptions={[5, 10, 25, 50, 100]}
      checkboxSelection={false}
      disableRowSelectionOnClick
      keepNonExistentRowsSelected
      loading={loading}
      getRowId={(row) => row.id}
      slots={{
        footer: CustomFooter,
      }}
      sx={{
        width: '100%',
        height: 'auto',
        borderRadius: 1,
        borderColor: 'divider',
        '& .MuiDataGrid-virtualScroller': {
          overflow: 'auto !important',
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: 'grey.50',
          textTransform: 'uppercase',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: 0.3,
        },
        "& .MuiDataGrid-columnSeparator": {
          opacity: 0.2,
        },
        "& .MuiDataGrid-cell": {
          fontSize: '0.9rem',
        },
        "& .MuiDataGrid-row:hover": {
          backgroundColor: 'action.hover',
        },
        "& .MuiDataGrid-virtualScrollerRenderZone": {
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: 'grey.50',
          },
        },
      }}
    />
  );
}
