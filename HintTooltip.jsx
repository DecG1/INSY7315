// HintTooltip: Reusable tooltip component with 1-second hover delay
import React, { useState, useRef, useEffect } from "react";
import { Box, Tooltip } from "@mui/material";
import { useHints } from "./HintsContext.jsx";

/**
 * HintTooltip component
 * Shows a tooltip after hovering for 1 second if hints are enabled
 * Respects global hints setting from HintsContext
 * 
 * @param {string} title - Tooltip text to display
 * @param {React.Node} children - Element to wrap with tooltip
 * @param {string} placement - Tooltip placement (top, bottom, left, right)
 * @returns {React.ReactElement} - Wrapped element with tooltip functionality
 */
const HintTooltip = ({ title, children, placement = "top" }) => {
  const { hintsEnabled } = useHints();
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef(null);

  // Don't show tooltips if hints are disabled in settings
  if (!hintsEnabled) {
    return <>{children}</>;
  }

  /**
   * Handle mouse enter - start 1-second timer
   */
  const handleMouseEnter = () => {
    // Start 1-second timer
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
  };

  /**
   * Handle mouse leave - clear timer and hide tooltip
   */
  const handleMouseLeave = () => {
    // Clear timer and hide tooltip
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  // Cleanup timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Tooltip
      title={title}
      open={showTooltip}
      placement={placement}
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            fontSize: '0.875rem',
            fontWeight: 500,
            p: 1.5,
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          },
        },
        arrow: {
          sx: {
            color: 'rgba(0, 0, 0, 0.9)',
          },
        },
      }}
    >
      <Box
        component="span"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ display: 'inline-flex' }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

export default HintTooltip;
