import React from "react";
import { Chip } from "@mui/material";

const ExpiryChip = ({ dateStr }) => {
  // Handle invalid or missing dates
  if (!dateStr) {
    return <Chip size="small" color="default" label="No expiry" />;
  }

  const now = new Date();
  const d = new Date(dateStr);
  
  // Check if date is invalid
  if (isNaN(d.getTime())) {
    return <Chip size="small" color="default" label="Invalid date" />;
  }
  
  const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  
  // Format date as readable string (e.g., "Nov 14, 2025")
  const formattedDate = d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  let color = "success";
  let label = formattedDate;
  if (days <= 7 && days >= 0) { color = "warning"; label = `${formattedDate} (soon)`; }
  if (days < 0) { color = "error"; label = `${formattedDate} (expired)`; }
  return <Chip size="small" color={color} label={label} />;
};

export default ExpiryChip;
