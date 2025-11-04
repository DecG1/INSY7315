import React from "react";
import logoImage from "/restaurant-logo.png";

/**
 * Restaurant Logo Component
 * Displays the uploaded restaurant logo image
 * Responsive sizing based on props
 * 
 * @param {number} size - Width/height of the logo in pixels (default: 42)
 * @param {string} className - Optional CSS class name
 */
const Logo = ({ size = 42, className = "" }) => {
  return (
    <img
      src={logoImage}
      alt="Restaurant Logo"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
      onError={(e) => {
        console.error('Logo failed to load');
        // Hide image if it fails to load
        e.target.style.display = 'none';
      }}
    />
  );
};

export default Logo;
