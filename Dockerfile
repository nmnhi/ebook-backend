# # Base image Node.js
# FROM node:20-alpine

# # Tạo thư mục làm việc
# WORKDIR /app

# # Copy package.json và cài dependencies
# COPY package*.json ./
# RUN npm install --omit=dev

# # Copy toàn bộ source code
# COPY . .

# # Expose port
# EXPOSE 8080

# # Lệnh chạy server
# CMD ["npm", "start"]


# Base image Node.js (Debian-based, supports glibc)
FROM node:20-slim

# Install espeak-ng (required by Piper)
RUN apt-get update && apt-get install -y \
    espeak-ng \
    libespeak-ng1 \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy entire project
COPY . .

# Piper needs this to find .so libraries
ENV LD_LIBRARY_PATH=/app/piper

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
