// InventoryPage: displays inventory table, search, and actions
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, TextField, Card, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Tooltip, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, IconButton
} from "@mui/material";
import { PlusCircle, QrCode, Filter, Edit, Search, Boxes, Trash2 } from "lucide-react";

import SectionTitle from "./SectionTitle.jsx";
import ExpiryChip from "./ExpiryChip.jsx";
import HintTooltip from "./HintTooltip.jsx";

// Dexie services
import { listInventory, addInventory, deleteInventory } from "./inventoryService.js";
import { updateInventory } from "./inventoryService.js"; // ensure exported
import { logInventoryAdded, logInventoryDeleted, logInventoryUpdated } from "./auditService.js";
import { CONV } from "./units.js";

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState(null); // item being edited

  // load from Dexie
  useEffect(() => {
    (async () => setRows(await listInventory()))();
  }, []);

  const refresh = async () => setRows(await listInventory());

  const filtered = useMemo(
    () => rows.filter(i => i.name.toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  );

  async function handleAdded(newItem) {
    await addInventory(newItem);        // TOTAL cost; service computes ppu
    try { 
      await logInventoryAdded(newItem); 
    } catch (e) {
      console.error("Failed to log inventory addition:", e);
    }
    await refresh();
  }

  async function handleDelete(id) {
    const item = rows.find(r => r.id === id);
    await deleteInventory(id);
    if (item) {
      try {
        await logInventoryDeleted(item);
      } catch (e) {
        console.error("Failed to log inventory deletion:", e);
      }
    }
    await refresh();
  }

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        animation: 'fadeIn 0.6s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <SectionTitle
        icon={Boxes}
        title="Inventory"
        action={
          <Box sx={{ display: "flex", gap: 2 }}>
            <HintTooltip hint="Add a new ingredient or item to your inventory with name, quantity, unit, cost, and expiry date">
              <Button
                variant="contained"
                startIcon={<PlusCircle size={16} />}
                onClick={() => setOpenAdd(true)}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Add New Item
              </Button>
            </HintTooltip>
            <HintTooltip hint="Scan item barcode to quickly add to inventory (coming soon)">
              <Button
                variant="outlined"
                startIcon={<QrCode size={16} />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Scan New Item
              </Button>
            </HintTooltip>
            <HintTooltip hint="Export your inventory data to a CSV file for reports or backup">
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Export Inventory
              </Button>
            </HintTooltip>
            <HintTooltip hint="View all items that are out of stock or below minimum quantity">
              <Button
                variant="text"
                color="error"
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View Depleted Stock
              </Button>
            </HintTooltip>
          </Box>
        }
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <HintTooltip hint="Search for ingredients by name">
          <TextField
            size="small"
            placeholder="Search ingredients…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
              width: '400px',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
        </HintTooltip>
        <HintTooltip hint="Filter inventory by category, expiry date, or stock level">
          <Button
            variant="outlined"
            startIcon={<Filter size={16} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Filters
          </Button>
        </HintTooltip>
      </Box>

      <Card
        sx={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Unit Price (ZAR)</TableCell> {/* derived */}
              <TableCell>Total Cost (ZAR)</TableCell> {/* as entered */}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => {
              const factor = CONV[row.unit] ?? 1;
              const ppu = Number.isFinite(row.ppu)
                ? Number(row.ppu)
                : (Number(row.cost || 0) / ((Number(row.qty || 0) * factor) || 1));
              const unitPrice = ppu * factor;

              return (
                <TableRow key={row.id ?? row.name} hover>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.qty}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell><ExpiryChip dateStr={row.expiry} /></TableCell>
                  <TableCell>{unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{Number(row.cost || 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <HintTooltip hint="Edit this item's quantity, cost, unit, or expiry date">
                      <IconButton onClick={() => { setCurrent(row); setOpenEdit(true); }}>
                        <Edit size={16} />
                      </IconButton>
                    </HintTooltip>
                    <HintTooltip hint="Permanently delete this item from inventory">
                      <IconButton color="error" onClick={() => handleDelete(row.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </HintTooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography color="text.secondary">No inventory yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button disabled>Previous</Button>
        <Typography variant="body2" color="text.secondary">Page 1 of 2</Typography>
        <Button>Next</Button>
      </Box>

      {/* Add / Edit dialogs */}
      <AddInventoryDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={async (item) => { await handleAdded(item); setOpenAdd(false); }}
      />

      {current && (
        <EditInventoryDialog
          open={openEdit}
          item={current}
          onClose={() => { setOpenEdit(false); setCurrent(null); }}
          onSaved={async () => { await refresh(); setOpenEdit(false); setCurrent(null); }}
        />
      )}
    </Box>
  );
}

// ---- Add dialog (TOTAL cost) ----
function AddInventoryDialog({ open, onClose, onSave }) {
  const initial = { name: "", qty: 0, unit: "g", expiry: "", cost: 0, reorder: 0 };
  const [form, setForm] = useState(initial);

  useEffect(() => { if (open) setForm(initial); }, [open]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canSave = form.name.trim() && Number(form.qty) > 0 && form.unit;

  const factor = CONV[form.unit] ?? 1;
  const derivedUnitPrice = (Number(form.cost || 0) / ((Number(form.qty || 0) * factor) || 1)) || 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Inventory Item</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
        <TextField label="Name" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={form.qty === 0 ? "" : form.qty}
            onChange={(e) => update("qty", e.target.value === "" ? 0 : Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
          <TextField select label="Unit" value={form.unit} onChange={(e) => update("unit", e.target.value)}>
            {["g", "kg", "ml", "l", "ea"].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
        </Box>
        <TextField label="Expiry (YYYY-MM-DD)" value={form.expiry} onChange={(e) => update("expiry", e.target.value)} />
        <TextField
          label="Total Cost (ZAR for this quantity)"
          type="number"
          inputProps={{ step: "0.01", min: 0 }}
          value={form.cost === 0 ? "" : form.cost}
          onChange={(e) => update("cost", e.target.value === "" ? 0 : Number(e.target.value))}
          helperText="e.g., 20 kg potatoes for R200 → enter 20, kg, 200"
        />
        {form.qty > 0 && form.unit && form.cost > 0 && (
          <Typography variant="caption" color="text.secondary">
            Derived unit price: R{derivedUnitPrice.toFixed(4)} per {form.unit}
          </Typography>
        )}
        <TextField
          label="Reorder threshold"
          type="number"
          inputProps={{ min: 0 }}
          value={form.reorder === 0 ? "" : form.reorder}
          onChange={(e) => update("reorder", e.target.value === "" ? 0 : Number(e.target.value))}
          helperText="Alert when quantity drops to or below this value"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave} onClick={() => onSave({ ...form })}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---- Edit dialog (fix/edit fields + optional top-up) ----
function EditInventoryDialog({ open, item, onClose, onSaved }) {
  // copy current values
  const [form, setForm] = useState({
    name: item.name || "",
    qty: Number(item.qty || 0),
    unit: item.unit || "g",
    expiry: item.expiry || "",
    cost: Number(item.cost || 0),      // total cost so far
    reorder: Number(item.reorder || 0),
  });

  // top-up inputs (optional)
  const [addQty, setAddQty] = useState("");
  const [addCost, setAddCost] = useState("");

  useEffect(() => {
    if (open && item) {
      setForm({
        name: item.name || "",
        qty: Number(item.qty || 0),
        unit: item.unit || "g",
        expiry: item.expiry || "",
        cost: Number(item.cost || 0),
        reorder: Number(item.reorder || 0),
      });
      setAddQty("");
      setAddCost("");
    }
  }, [open, item]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const factor = CONV[form.unit] ?? 1;
  const derivedUnitPrice = (Number(form.cost || 0) / ((Number(form.qty || 0) * factor) || 1)) || 0;

  const canSave = form.name.trim() && Number(form.qty) >= 0 && form.unit;

  async function saveChanges() {
    // If user typed top-up values, merge them into qty/cost first
    const incQty = addQty === "" ? 0 : Number(addQty);
    const incCost = addCost === "" ? 0 : Number(addCost);

    const nextQty = Number(form.qty || 0) + (isFinite(incQty) ? incQty : 0);
    const nextCost = Number(form.cost || 0) + (isFinite(incCost) ? incCost : 0);

    const updatedItem = {
      name: form.name.trim(),
      qty: nextQty,
      unit: form.unit,
      expiry: form.expiry,
      cost: nextCost,          // TOTAL cost (service recomputes ppu)
      reorder: Number(form.reorder || 0),
    };

    await updateInventory(item.id, updatedItem);
    
    // Log the update with changes
    try {
      await logInventoryUpdated(item, { ...item, ...updatedItem });
    } catch (e) {
      console.error("Failed to log inventory update:", e);
    }

    await onSaved();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Inventory Item</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: 2 }}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          autoFocus
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={form.qty === 0 ? "" : form.qty}
            onChange={(e) => update("qty", e.target.value === "" ? 0 : Number(e.target.value))}
            inputProps={{ min: 0 }}
          />
          <TextField
            select
            label="Unit"
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
          >
            {["g", "kg", "ml", "l", "ea"].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
        </Box>

        <TextField
          label="Expiry (YYYY-MM-DD)"
          value={form.expiry}
          onChange={(e) => update("expiry", e.target.value)}
        />

        <TextField
          label="Total Cost to date (ZAR)"
          type="number"
          inputProps={{ step: "0.01", min: 0 }}
          value={form.cost === 0 ? "" : form.cost}
          onChange={(e) => update("cost", e.target.value === "" ? 0 : Number(e.target.value))}
          helperText="Total spent on this item so far (for the remaining quantity)"
        />

        {form.qty > 0 && form.unit && form.cost >= 0 && (
          <Typography variant="caption" color="text.secondary">
            Derived unit price: R{derivedUnitPrice.toFixed(4)} per {form.unit}
          </Typography>
        )}

        {/* Optional top-up section */}
        <Box sx={{ borderTop: "1px solid #eee", pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Top-up Stock (optional)</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="Additional Quantity"
              type="number"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              inputProps={{ min: 0 }}
              placeholder="e.g., 5"
            />
            <TextField
              label="Top-up Total Cost (ZAR)"
              type="number"
              value={addCost}
              onChange={(e) => setAddCost(e.target.value)}
              inputProps={{ step: "0.01", min: 0 }}
              placeholder="e.g., 50"
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            These values will be added to Quantity and Total Cost, and the unit price will be recalculated.
          </Typography>
        </Box>

        <TextField
          label="Reorder threshold"
          type="number"
          inputProps={{ min: 0 }}
          value={form.reorder === 0 ? "" : form.reorder}
          onChange={(e) => update("reorder", e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave} onClick={saveChanges}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
