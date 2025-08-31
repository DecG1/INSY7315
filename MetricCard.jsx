
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
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="h5" fontWeight={800}>{value}</Typography>
          {note && <Typography variant="caption" color="text.secondary">{note}</Typography>}
        </Box>
        {Icon && <Icon size={22} />}
      </Box>
    </CardContent>
  </Card>
);

export default MetricCard;
