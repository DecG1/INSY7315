import React from "react";

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
      src="/logo.png"
      alt="Restaurant Logo"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
};

export default Logo;
