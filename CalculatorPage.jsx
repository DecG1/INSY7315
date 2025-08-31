import React, { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Divider, Button, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import SectionTitle from "../components/SectionTitle";
import { recipes } from "../utils/mockData";
import { currency } from "../utils/helpers";

const CalculatorPage = () => {
  const [sel, setSel] = useState(recipes[0]?.name || "");
  const [qty, setQty] = useState(1);
  const base = useMemo(() => recipes.find(r => r.name === sel)?.cost || 0, [sel]);
  const total = (base * qty).toFixed(2);

  return (
    <Box className="p-6 space-y-4">
      <SectionTitle icon={FileSpreadsheet} title="Calculate Recipe Ingredients" />
      <Box className="flex items-end gap-2">
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Recipe</InputLabel>
          <Select label="Recipe" value={sel} onChange={(e) => setSel(e.target.value)}>
            {recipes.map((r) => <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Quantity" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        <Button variant="contained" color="error">Calculate</Button>
      </Box>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">Select a recipe and quantity to view ingredient breakdown.</Typography>
          <Divider className="my-3" />
          <Typography variant="subtitle1" fontWeight={700}>Calculation Summary</Typography>
          <Typography>Total Estimated Cost: {currency(total)}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CalculatorPage;
