// HintsContext: Global state for hints/tutorial system
import React, { createContext, useContext, useState, useEffect } from "react";

// Create context for hints state management
const HintsContext = createContext();

/**
 * Custom hook to access hints context
 * @returns {object} - { hintsEnabled, setHintsEnabled, toggleHints }
 * @throws {Error} - If used outside HintsProvider
 */
export const useHints = () => {
  const context = useContext(HintsContext);
  if (!context) {
    throw new Error("useHints must be used within HintsProvider");
  }
  return context;
};

/**
 * HintsProvider component
 * Provides global hints state to all child components
 * Persists hints preference to localStorage
 * @param {React.ReactNode} children - Child components
 */
export const HintsProvider = ({ children }) => {
  // Load hints preference from localStorage (default: enabled)
  const [hintsEnabled, setHintsEnabled] = useState(() => {
    const saved = localStorage.getItem("hintsEnabled");
    return saved !== null ? JSON.parse(saved) : true; // default: enabled
  });

  // Persist to localStorage whenever hints setting changes
  useEffect(() => {
    localStorage.setItem("hintsEnabled", JSON.stringify(hintsEnabled));
  }, [hintsEnabled]);

  // Toggle function for convenience
  const toggleHints = () => setHintsEnabled(prev => !prev);

  return (
    <HintsContext.Provider value={{ hintsEnabled, setHintsEnabled, toggleHints }}>
      {children}
    </HintsContext.Provider>
  );
};
