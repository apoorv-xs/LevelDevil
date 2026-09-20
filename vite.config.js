import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

function salesApiDevPlugin() {
  return {
    name: "sales-api-dev-plugin",
    configureServer(server) {
      // 1. SPA & Route Rewrites for /sales, /contact, /workspace
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] || "";
        if (url === "/sales" || url === "/sales/" || url === "/contact" || url === "/contact/") {
          req.url = "/sales.html";
        } else if (url === "/workspace" || url === "/workspace/") {
          req.url = "/workspace/index.html";
        }
        next();
      });

      // 2. Local Dev Mock for POST /api/inquiry
      server.middlewares.use((req, res, next) => {
        if (req.method === "POST" && (req.url === "/api/inquiry" || req.url?.startsWith("/api/inquiry?"))) {
          let bodyStr = "";
          req.on("data", (chunk) => {
            bodyStr += chunk;
          });
          req.on("end", () => {
            try {
              const data = JSON.parse(bodyStr || "{}");
              const timestamp = new Date().toLocaleTimeString();
              console.log("\n");
              console.log("┌──────────────────────────────────────────────────────────────────────────┐");
              console.log(`│ 🚀 [DEV DISPATCH] NEW CLIENT INQUIRY RECEIVED [${timestamp}]`.padEnd(74) + "│");
              console.log("├──────────────────────────────────────────────────────────────────────────┤");
              console.log(`│ 👤 Name:    ${(data.name || "N/A").slice(0, 60)}`.padEnd(74) + "│");
              console.log(`│ ✉️  Email:   ${(data.email || "N/A").slice(0, 60)}`.padEnd(74) + "│");
              console.log(`│ 🎯 Scope:   ${(data.scope || "N/A").slice(0, 60)}`.padEnd(74) + "│");
              console.log(`│ 💰 Budget:  ${(data.budget || "N/A").slice(0, 60)}`.padEnd(74) + "│");
              console.log(`│ 📝 Message: ${(data.message || "N/A").slice(0, 60)}`.padEnd(74) + "│");
              console.log("└──────────────────────────────────────────────────────────────────────────┘\n");

              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({
                data: {
                  id: `inq_${Date.now().toString(36)}`,
                  status: "received",
                  receivedAt: new Date().toISOString(),
                  message: "Inquiry logged to dev server console successfully."
                }
              }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: { message: "Invalid JSON body" } }));
            }
          });
          return;
        }

        // 3. Local Dev Mock for GET /api/workspace
        if (req.method === "GET" && (req.url === "/api/workspace" || req.url?.startsWith("/api/workspace?"))) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            user: {
              uid: "owner_apoorv",
              email: "apoorvworkid@gmail.com",
              displayName: "Apoorv A S",
              role: "owner"
            },
            data: {
              applications: [],
              inquiries: []
            }
          }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [salesApiDevPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
