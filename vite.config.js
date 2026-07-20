import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import process from "node:process";
import { Buffer } from "node:buffer";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;

            if (id.includes("lucide-react")) return "icons";
            if (id.includes("framer-motion")) return "motion";
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react";
            }

            return "vendor";
          },
        },
      },
    },
    plugins: [react(), tailwindcss(), localAdminApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});

function localAdminApiPlugin() {
  const handlers = {
    "/api/admin/login": () => import("./api/admin/login.js"),
    "/api/admin/logout": () => import("./api/admin/logout.js"),
    "/api/admin/proxy": () => import("./api/admin/proxy.js"),
  };

  return {
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url || "", "http://localhost").pathname;
        const loadHandler = handlers[pathname];

        if (!loadHandler) {
          next();
          return;
        }

        try {
          request.body = await readJsonBody(request);
          addResponseHelpers(response);
          const { default: handler } = await loadHandler();

          await handler(request, response);
        } catch (error) {
          console.error("Local admin API failed", error);
          if (!response.headersSent) {
            response.status(500).json({ error: "Local admin API failed." });
          }
        }
      });
    },
    name: "local-admin-api",
  };
}

function addResponseHelpers(response) {
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (body) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(body));
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");

      if (!text) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(text));
      } catch {
        reject(new Error("Invalid JSON request body."));
      }
    });
    request.on("error", reject);
  });
}
