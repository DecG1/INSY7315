
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
      {Icon && (
        <Box
          sx={{
            bgcolor: 'rgba(139, 0, 0, 0.08)',
            p: 1,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color="#8b0000" />
        </Box>
      )}
      <Typography variant="h6" fontWeight={700} sx={{ color: '#2c3e50', letterSpacing: '-0.3px' }}>
        {title}
      </Typography>
    </Box>
    {action}
  </Box>
);

export default SectionTitle;
