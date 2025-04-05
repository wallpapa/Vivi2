# Build stage
FROM node:20.11.0-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV RAILWAY_ENVIRONMENT=production
ENV PATH /app/node_modules/.bin:$PATH

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build frontend
RUN npm run build:frontend

# Build backend
RUN npm run build:backend

# Production stage
FROM node:20.11.0-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Set production environment variables
ENV NODE_ENV=production
ENV RAILWAY_ENVIRONMENT=production

# Install production dependencies
RUN npm install --production --legacy-peer-deps

# Add tini
RUN apk add --no-cache tini

# Expose the port the app runs on
EXPOSE 8080

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]

# Start the server
CMD ["node", "--experimental-specifier-resolution=node", "dist/server/index.js"] 