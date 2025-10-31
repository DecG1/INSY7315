
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
      height: '100%',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    }}
  >
    <CardContent sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', height: '100%' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ 
              mt: 0.5, 
              mb: 1, 
              color: '#0f172a',
              fontSize: '2rem',
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          {note && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.8125rem',
                mt: 'auto',
                fontWeight: 500,
              }}
            >
              {note}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.1) 0%, rgba(139, 0, 0, 0.05) 100%)',
              p: 1.75,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(139, 0, 0, 0.1)',
            }}
          >
            <Icon size={26} color="#8b0000" strokeWidth={2.5} />
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default MetricCard;
