import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "efe9-2401-4900-1cbc-4194-6938-106e-d8de-bbf2.ngrok-free.app",
    ],
  },
});
