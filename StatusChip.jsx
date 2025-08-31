import React from "react";
import { Chip } from "@mui/material";

const StatusChip = ({ label, color = "default" }) => (
  <Chip size="small" label={label} color={color} variant={color === "default" ? "outlined" : "filled"} />
);

export default StatusChip;
