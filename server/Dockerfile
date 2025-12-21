# Base image
FROM node:20-alpine

# App directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install --production

# Copy rest of the code
COPY . .

# Fly default port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
