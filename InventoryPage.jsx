// InventoryPage: displays inventory table, search, and actions
import React, { useMemo, useState } from "react";
import {
  Box, Button, TextField, Card, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Tooltip, InputAdornment
} from "@mui/material";
import { PlusCircle, QrCode, Filter, Edit, Search, Boxes } from "lucide-react";

// ⬅️ these files are in the SAME folder as InventoryPage.jsx
import SectionTitle from "./SectionTitle.jsx";
import ExpiryChip from "./ExpiryChip.jsx";
import { mockInventory } from "./mockData.js";

const InventoryPage = () => {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => mockInventory.filter(i => i.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ✅ use the icon component directly, NOT require(...) */}
      <SectionTitle
        icon={Boxes}
        title="Inventory"
        action={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" startIcon={<PlusCircle size={16} />}>
              Add New Item
            </Button>
            <Button variant="outlined" startIcon={<QrCode size={16} />}>Scan New Item</Button>
            <Button variant="outlined">Export Inventory</Button>
            <Button variant="text" color="error">View Depleted Stock</Button>
          </Box>
        }
      />

      {/* ✅ Search uses MUI InputAdornment */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search ingredients…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" startIcon={<Filter size={16} />}>Filters</Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Unit Cost (ZAR)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.name} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.qty}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell><ExpiryChip dateStr={row.expiry} /></TableCell>
                <TableCell>{row.cost.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <Button><Edit size={16} /></Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button disabled>Previous</Button>
        <Typography variant="body2" color="text.secondary">Page 1 of 2</Typography>
        <Button>Next</Button>
      </Box>
    </Box>
  );
};

export default InventoryPage;
