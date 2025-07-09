import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const keyPath = path.resolve(__dirname, "cert/key.pem");
  const certPath = path.resolve(__dirname, "cert/cert.pem");

  let https = false;
  try {
    https = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } catch (err) {
    console.error("❌ Ошибка чтения SSL-сертификатов:", err.message);
  }

  console.log("HTTPS config:", https); // ← добавлено

  return {
    server: {
      host: true,
      port: 8080,
      https,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});