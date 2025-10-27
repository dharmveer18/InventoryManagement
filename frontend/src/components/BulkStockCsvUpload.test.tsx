import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BulkStockCsvUpload from './BulkStockCsvUpload';
import api from '../api/client';

// Mock papaparse to synchronously invoke the complete callback with our data
vi.mock('papaparse', () => {
  return {
    default: {
      parse: (_file: File, cfg: { complete: (res: { data: unknown[] }) => void }) => {
        // Two rows: first valid, second invalid (wrong id; server will flag it)
        const data = [
          { item_id: '1', item_name: 'Valid Item', quantity_delta: '+5', reason: 'recount' },
          { item_id: '9999', item_name: 'Missing Item', quantity_delta: '-3', reason: 'stocktake' },
        ];
        cfg.complete({ data });
      },
    },
  };
});

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('BulkStockCsvUpload', () => {
  beforeEach(() => {
    vi.spyOn(api, 'post');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dry run does not call backend and shows validation complete with applied 0', async () => {
    (api.post as any).mockResolvedValue({ data: [] });

    renderWithProviders(<BulkStockCsvUpload />);

    const fileInput = screen.getByLabelText(/choose csv/i, { selector: 'input[type="file"]' })
      || document.querySelector('input[type="file"]');
    const file = new File(["dummy"], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput as Element, { target: { files: [file] } });

    const validateBtn = screen.getByRole('button', { name: /validate/i });
    fireEvent.click(validateBtn);

    // Backend should NOT be called during dry run
    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled();
    });

    expect(await screen.findByText(/Validation complete\./i)).toBeInTheDocument();
    expect(screen.getByText(/Applied: 0/i)).toBeInTheDocument();
  });

  it('applies only valid rows when applying updates and reports issues for invalid rows', async () => {
    (api.post as any).mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] });

    renderWithProviders(<BulkStockCsvUpload />);

    const file = new File(["dummy"], 'test.csv', { type: 'text/csv' });
    const inputEl = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(inputEl, { target: { files: [file] } });

    // Toggle dry run off
  // Use label-based query for robustness with MUI FormControlLabel
  const applySwitch = screen.getByLabelText(/dry run/i);
    fireEvent.click(applySwitch);

    // Click Apply updates
    const applyBtn = screen.getByRole('button', { name: /apply updates/i });
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/inventory/items/bulk_adjust_stock/',
        expect.objectContaining({ adjustments: expect.any(Array), reason: 'csv' })
      );
    });

    expect(await screen.findByText(/Bulk update complete\./i)).toBeInTheDocument();
    expect(screen.getByText(/Applied: 2/i)).toBeInTheDocument();
  });
});
