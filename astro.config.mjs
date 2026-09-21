import { defineConfig } from "astro/config";
import profile from "./src/data/profile.json";

export default defineConfig({
  site: profile.url,
  output: "static",
  build: {
    format: "directory"
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
