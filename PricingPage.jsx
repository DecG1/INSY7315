import React, { useState } from "react";
import { Box, Card, CardContent, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField, Divider, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { DollarSign, Filter } from "lucide-react";
import SectionTitle from "./SectionTitle.jsx";
import { priceList } from "./mockData.js";
import { currency } from "./helpers.js";

const PricingPage = () => {
  const [sel, setSel] = useState(priceList[0]?.name || "Fresh Tomatoes (per kg)");
  const [newPrice, setNewPrice] = useState(28.5);
  const [history, setHistory] = useState([
    { name: "Italian Sausage", from: 80, to: 85, date: "2024-07-21" },
  ]);

  const updatePrice = () => {
    setHistory((h) => [{ name: sel, from: 0, to: newPrice, date: new Date().toISOString().slice(0, 10) }, ...h]);
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 4,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <SectionTitle icon={DollarSign} title="Price List" />
          <Box className="flex items-center gap-2 mb-2">
            <TextField size="small" placeholder="Search ingredient" />
            <Button variant="outlined" startIcon={<Filter size={16} />}>Filter</Button>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ingredient Name</TableCell>
                <TableCell>Current Price</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priceList.map((p) => (
                <TableRow key={p.name} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell><Chip color="success" label={currency(p.price)} /></TableCell>
                  <TableCell>{p.updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <SectionTitle title="Update Ingredient Price" />
          <FormControl fullWidth>
            <InputLabel>Ingredient</InputLabel>
            <Select label="Ingredient" value={sel} onChange={(e) => setSel(e.target.value)}>
              {priceList.map((p) => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="New Price" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} />
          <Button variant="contained" color="error" onClick={updatePrice}>Update Price</Button>

          <Divider />
          <Typography variant="subtitle1" fontWeight={700}>Price History Log</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Change</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell>{h.name}</TableCell>
                  <TableCell>{currency(h.from)} → {currency(h.to)}</TableCell>
                  <TableCell>{h.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PricingPage;
