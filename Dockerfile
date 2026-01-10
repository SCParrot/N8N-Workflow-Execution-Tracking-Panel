# Multi-stage build to reduce image size
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy project files
COPY . .

# Build production version
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Copy necessary files from build stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/config ./config

# Expose port
EXPOSE 3000

# Run app as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node -e "
    const http = require('http');
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/', method: 'HEAD' }, (res) => {
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
    req.on('error', () => process.exit(1));
    req.end();
  "

# Start app
CMD ["pm2-runtime", "npm", "--", "start"]
