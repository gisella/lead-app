# Multi-stage build for NestJS application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Copy source code
COPY apps/ ./apps/
COPY libs/ ./libs/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Generate Prisma client using npm script
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy the Prisma client from the custom location
COPY --from=builder --chown=nestjs:nodejs /app/libs/shared/src/libs/database/prisma/src/database/client ./libs/shared/src/libs/database/prisma/src/database/client

# Copy Prisma schema and migrations
COPY --from=builder --chown=nestjs:nodejs /app/libs/shared/src/libs/database/prisma/src/database/schema.prisma ./libs/shared/src/libs/database/prisma/src/database/schema.prisma
COPY --from=builder --chown=nestjs:nodejs /app/libs/shared/src/libs/database/prisma/src/database/migrations ./libs/shared/src/libs/database/prisma/src/database/migrations

# Copy startup script from docker directory
COPY docker/app_start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown nestjs:nodejs /app/start.sh

# Create logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application with migrations
CMD ["/app/start.sh"]
