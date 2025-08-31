import React from "react";
import { Chip } from "@mui/material";

const ExpiryChip = ({ dateStr }) => {
  const now = new Date();
  const d = new Date(dateStr);
  const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  let color = "success";
  let label = dateStr;
  if (days <= 7 && days >= 0) { color = "warning"; label = `${dateStr} (soon)`; }
  if (days < 0) { color = "error"; label = `${dateStr} (expired)`; }
  return <Chip size="small" color={color} label={label} />;
};

export default ExpiryChip;
