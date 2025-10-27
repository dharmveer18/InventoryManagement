import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  Tooltip,
  FormControlLabel,
} from '@mui/material';
import Papa from 'papaparse';
import type { ParseResult, ParseError } from 'papaparse';
import useBulkStockMutation from '../hooks/useBulkStockMutation';
import type { ParsedRow, StockRow } from '../types/bulk';
import { nk, intOrUndef } from '../utils/csv';

// CSV parser configured for item_id, item_name (optional), quantity_delta, reason (optional)
function parseCsv(
  file: File,
  onDone: (rows: ParsedRow[], errs: string[]) => void
) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: ({ data }: ParseResult) => {
      const rows: ParsedRow[] = [];
      const errs: string[] = [];
      const raw = (Array.isArray(data) ? (data as unknown[]) : []) as any[];
      if (!raw.length) {
        onDone([], ['CSV is empty']);
        return;
      }
      raw.forEach((r, i) => {
        const item_id = nk(r.item_id) || undefined;
        const item_name = nk(r.item_name) || undefined;
        const quantity_delta = intOrUndef(r.quantity_delta);
        const reason = nk(r.reason) || undefined;
        const row = i + 2; // header at row 1

        let invalid = '';
        if (!item_id) invalid = 'item_id required';
        else if (quantity_delta == null) invalid = 'quantity_delta required (integer)';

        rows.push({
          row,
          item_id,
          item_name,
          quantity_delta,
          reason,
          invalid: invalid || undefined,
        });
      });
      onDone(rows, errs);
    },
    error: (e: ParseError) => onDone([], [e.message]),
  });
}

export default function BulkStockCsvUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [dryRun, setDryRun] = useState(true);
  const mutation = useBulkStockMutation();

  const choose = () => inputRef.current?.click();
  const onFile = (f: File) =>
    parseCsv(f, (r, errs) => {
      setRows(r);
      setParseErrors(errs);
    });

  const clientValid: StockRow[] = rows
    .filter((r) => !r.invalid)
    .map(({ item_id, item_name, quantity_delta, reason }) => ({
      item_id,
      item_name,
      quantity_delta,
      reason,
    }));

  const onSubmit = () => {
    mutation.mutate({ rows: clientValid, dryRun });
  };

  const downloadTemplate = () => {
    const csv = [
      ['item_id', 'item_name', 'quantity_delta', 'reason'],
      ['123', 'Optional name', '-5', 'stocktake'],
      ['456', '', '+10', 'recount'],
    ]
      .map((r) => r.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const serverErrorsByRow = new Map<number, string>();
  (mutation.data?.errors || []).forEach((e) => serverErrorsByRow.set(e.row, e.message));

  const hasAnyErrors =
    parseErrors.length > 0 || (mutation.isSuccess && (mutation.data?.errors?.length || 0) > 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="h6">Bulk Stock Update</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" onClick={downloadTemplate}>
            Template
          </Button>
          <Button variant="outlined" onClick={choose}>
            Choose CSV
          </Button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".csv"
            aria-label="Choose CSV"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              e.target.files?.[0] && onFile(e.target.files[0])
            }
          />

          <Tooltip title="Validate only (no changes)">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={dryRun}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDryRun(e.target.checked)}
                />
              }
              label="Dry run"
            />
          </Tooltip>

          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!clientValid.length || mutation.isPending}
          >
            {mutation.isPending ? (dryRun ? 'Validating...' : 'Applying...') : dryRun ? 'Validate' : 'Apply updates'}
          </Button>
        </Stack>
      </Stack>

      {mutation.isPending && <LinearProgress sx={{ mt: 2 }} />}

      {parseErrors.map((e, i) => (
        <Alert key={i} severity="error" sx={{ mt: 2 }}>
          {e}
        </Alert>
      ))}

      {mutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {(mutation.error as Error).message}
        </Alert>
      )}

      {mutation.isSuccess && mutation.data && (
        <Alert severity={hasAnyErrors ? 'warning' : 'success'} sx={{ mt: 2 }}>
          {dryRun ? 'Validation complete.' : 'Bulk update complete.'} Applied: {mutation.data.applied}.{' '}
          {mutation.data.errors?.length ? `${mutation.data.errors.length} issue(s).` : 'No issues.'}
        </Alert>
      )}

      {!!rows.length && (
        <Paper sx={{ mt: 2, overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Row', 'item_id', 'item_name', 'quantity_delta', 'reason', 'status'].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(0, 50).map((r) => {
                const serverMsg = serverErrorsByRow.get(r.row);
                const invalidMsg = r.invalid;
                const status = invalidMsg ? invalidMsg : serverMsg ? serverMsg : 'OK';
                const isBad = Boolean(invalidMsg || serverMsg);
                return (
                  <TableRow key={r.row} selected={isBad}>
                    <TableCell>{r.row}</TableCell>
                    <TableCell>{r.item_id || ''}</TableCell>
                    <TableCell>{r.item_name || ''}</TableCell>
                    <TableCell>{r.quantity_delta ?? ''}</TableCell>
                    <TableCell>{r.reason || ''}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
        Endpoint: POST /inventory/items/bulk_adjust_stock/ — send {'{ adjustments, reason }'} (apply only). Use Dry run
        to validate without changes. On success, the items list is refreshed.
      </Typography>
    </Box>
  );
}
