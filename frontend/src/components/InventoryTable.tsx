import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { columnsFactory } from "../pages/dashboard/columns";
import { Item } from "../types";

type Props = {
  items: Item[];
  loading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onAdjust: (item: Item) => void;
  userRole?: string;
};

export function InventoryTable({ items, loading, onEdit, onDelete, onAdjust }: Props) {
  const columns = React.useMemo(() => columnsFactory({ onEdit, onDelete, onAdjust }), [onEdit, onDelete, onAdjust]);

  return (
    <DataGrid
      rows={items}
      columns={columns}
      autoHeight
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 25,
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
      pageSizeOptions={[25, 50, 100]}
      checkboxSelection={false}
      disableRowSelectionOnClick
      keepNonExistentRowsSelected
      loading={loading}
      getRowId={(row) => row.id}
      sx={{
        "& .MuiDataGrid-cell": {
          fontSize: "0.95rem",
        },
      }}
    />
  );
}
