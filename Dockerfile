FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"] 