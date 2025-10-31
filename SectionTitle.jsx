
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
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    mb: 4,
    pb: 2,
    borderBottom: '2px solid',
    borderColor: 'divider',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Icon && (
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.12) 0%, rgba(139, 0, 0, 0.06) 100%)',
            p: 1.5,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(139, 0, 0, 0.1)',
          }}
        >
          <Icon size={24} color="#8b0000" strokeWidth={2.5} />
        </Box>
      )}
      <Box>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          sx={{ 
            color: '#0f172a', 
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
    {action && <Box>{action}</Box>}
  </Box>
);

export default SectionTitle;
