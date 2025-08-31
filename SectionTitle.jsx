
// SectionTitle: reusable section header with optional icon and action
import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * SectionTitle component
 * @param {React.Component} icon - Optional icon component
 * @param {string} title - Section title text
 * @param {React.Node} action - Optional action element (e.g., button)
 */
const SectionTitle = ({ icon: Icon, title, action }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Icon && <Icon size={18} />}
      <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
    </Box>
    {action}
  </Box>
);

export default SectionTitle;
