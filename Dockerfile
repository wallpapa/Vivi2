# Build stage
FROM node:20.11.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20.11.0-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only with legacy peer deps
RUN npm install --production --legacy-peer-deps

# Add tini
RUN apk add --no-cache tini

# Expose the port the app runs on
EXPOSE 8080

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# The actual command will be provided by Railway's startCommand
CMD ["node", "--experimental-specifier-resolution=node", "dist/server/index.js"] 