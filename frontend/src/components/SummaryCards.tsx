import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
      <Card>
        <CardActionArea onClick={() => navigate("/items")}>
        <CardContent>
          <Typography variant="h6">Total Items</Typography>
          <Typography variant="h4">{itemsCount}</Typography>
        </CardContent>
        </CardActionArea>
      </Card>
      <Card>
        <CardActionArea onClick={() => navigate("/items?filter=low")}>
        <CardContent>
          <Typography variant="h6">Low Stock Items</Typography>
          <Typography variant="h4">{lowStockCount}</Typography>
        </CardContent>
        </CardActionArea>
      </Card>
      <Card>
        <CardActionArea onClick={() => navigate("/categories")}>
        <CardContent>
          <Typography variant="h6">Categories</Typography>
          <Typography variant="h4">{categoriesCount}</Typography>
        </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default SummaryCards;
