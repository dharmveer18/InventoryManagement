import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export type SummaryCardsProps = {
  itemsCount: number;
  lowStockCount: number;
  categoriesCount: number;
};

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  itemsCount,
  lowStockCount,
  categoriesCount,
}) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6">Total Items</Typography>
          <Typography variant="h4">{itemsCount}</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Low Stock Items</Typography>
          <Typography variant="h4">{lowStockCount}</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Categories</Typography>
          <Typography variant="h4">{categoriesCount}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SummaryCards;
