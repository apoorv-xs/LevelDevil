# ==============================================================================
# SPRINTDIAL 24/7 CLOUD MCP SERVER FOR GEMINI SPARK (GOOGLE CLOUD RUN)
# ==============================================================================
# Ultra-lightweight, high-performance Node.js container with zero external dependencies.
# Boots in <20ms, serves Model Context Protocol over SSE and REST JSON endpoints.
# ==============================================================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=8080

# Copy package descriptors
COPY package.json ./

# Copy core MCP server engine and data sets
COPY mcp_spark_server.cjs ./
COPY workspace/ ./workspace/

# Google Cloud Run injects $PORT (default 8080)
EXPOSE 8080

# Launch server bound to 0.0.0.0
CMD ["node", "mcp_spark_server.cjs"]
