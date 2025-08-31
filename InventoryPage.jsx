
// InventoryPage: displays inventory table, search, and actions
import React, { useMemo, useState } from "react";
import { Box, Button, TextField, Card, Table, TableHead, TableRow, TableCell, TableBody, Typography, Tooltip } from "@mui/material";
import { PlusCircle, QrCode, Filter, Edit, Search } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import ExpiryChip from "../components/ExpiryChip";
import { mockInventory } from "../utils/mockData";

/**
 * InventoryPage
 * - Shows inventory table with search and actions
 * - Uses mock data for inventory
 * - Includes add, scan, export, and depleted stock actions (not functional)
 */
const InventoryPage = () => {
  // Search query state
  const [q, setQ] = useState("");
  // Filtered inventory based on search
  const filtered = useMemo(() => mockInventory.filter(i => i.name.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Page title and action buttons */}
      <SectionTitle icon={require("lucide-react").Boxes} title="Inventory" action={
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" startIcon={<PlusCircle size={16} />}>Add New Item</Button>
          <Button variant="outlined" startIcon={<QrCode size={16} />}>Scan New Item</Button>
          <Button variant="outlined">Export Inventory</Button>
          <Button variant="text" color="error">View Depleted Stock</Button>
        </Box>
      } />

      {/* Search and filter controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField size="small" placeholder="Search ingredients…" value={q} onChange={(e) => setQ(e.target.value)} InputProps={{ startAdornment: <Search size={16} sx={{ mr: 2 }} /> }} />
        <Button variant="outlined" startIcon={<Filter size={16} />}>Filters</Button>
      </Box>

      {/* Inventory table */}
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
            {/* Render filtered inventory rows */}
            {filtered.map((row) => (
              <TableRow key={row.name} hover>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.qty}</TableCell>
                <TableCell>{row.unit}</TableCell>
                <TableCell><ExpiryChip dateStr={row.expiry} /></TableCell>
                <TableCell>{row.cost.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><Button><Edit size={16} /></Button></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination controls (static) */}
      <Box className="flex items-center justify-between">
        <Button disabled>Previous</Button>
        <Typography variant="body2" color="text.secondary">Page 1 of 2</Typography>
        <Button>Next</Button>
      </Box>
    </Box>
  );
};

export default InventoryPage;
