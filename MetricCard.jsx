
// MetricCard: displays a metric with optional icon and note
import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

/**
 * MetricCard component
 * @param {string} title - Metric label
 * @param {string|number} value - Main value
 * @param {string} note - Optional note below value
 * @param {string} tone - Optional color tone (unused)
 * @param {React.Component} icon - Optional icon component
 */
const MetricCard = ({ title, value, note, tone = "default", icon: Icon }) => (
  <Card
    sx={{
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}
          >
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 1, mb: 0.5, color: '#2c3e50' }}>
            {value}
          </Typography>
          {note && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {note}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Box
            sx={{
              bgcolor: 'rgba(139, 0, 0, 0.08)',
              p: 1.5,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} color="#8b0000" />
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default MetricCard;
