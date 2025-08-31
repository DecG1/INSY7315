import React from "react";
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { QrCode, Upload, CheckCircle2 } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import StatusChip from "../components/StatusChip";
import { currency } from "../utils/helpers";

const ScannerPage = () => {
  const rows = [
    { dish: "Pasta Carbonara", qty: 2, cost: 240 },
    { dish: "Pizza Margherita", qty: 1, cost: 135 },
    { dish: "Tiramisu", qty: 2, cost: 160 },
    { dish: "Espresso", qty: 2, cost: 60 },
  ];
  const total = rows.reduce((a, b) => a + b.cost, 0);

  return (
    <Box className="p-6 space-y-4">
      <SectionTitle icon={QrCode} title="Docket Scanner" />
      <Card>
        <CardContent className="p-10 bg-[url('https://images.unsplash.com/photo-1551817958-20204c66f70b?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center rounded-2xl">
          <Box className="backdrop-blur-sm bg-white/70 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <Typography variant="h6" fontWeight={800}>Ready to Scan or Upload</Typography>
            <Button variant="contained" startIcon={<Upload size={16} />}>Upload Docket Image</Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionTitle title="Scanned Docket Details" />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dish Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Estimated Cost</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.dish} hover>
                  <TableCell>{r.dish}</TableCell>
                  <TableCell>{r.qty}</TableCell>
                  <TableCell>{currency(r.cost)}</TableCell>
                  <TableCell><StatusChip label="OK" color="success" /></TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} align="right"><b>Total Estimated Cost</b></TableCell>
                <TableCell><b>{currency(total)}</b></TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
          <Box className="flex gap-2 mt-4">
            <Button variant="contained" color="success" startIcon={<CheckCircle2 size={16} />}>Match with Recipes</Button>
            <Button variant="contained" color="error" startIcon={<Upload size={16} />}>Save to Inventory</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScannerPage;
