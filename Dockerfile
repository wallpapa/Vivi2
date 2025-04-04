# Build stage
FROM node:20.11.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

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
COPY --from=builder /app/server ./server

# Install production dependencies only
RUN npm install --production

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["node", "--experimental-specifier-resolution=node", "--enable-source-maps", "server/index.js"] 