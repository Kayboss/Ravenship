import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Suppress all console output in production builds (defense-in-depth against
  // leaking internals via devtools; our own code also gates via src/lib/logger.js)
  esbuild: command === "build" ? { drop: ["console"] } : undefined,
}));
