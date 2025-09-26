import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This tells Vite to handle JSX/TSX syntax
export default defineConfig({
  plugins: [react()],
});
