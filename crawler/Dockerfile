# UF COE Web Mapper Crawler Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Default output path (can be overridden)
ENV OUTPUT_PATH=/output/data.json

# Create output directory
RUN mkdir -p /output

# Run the crawler
CMD ["npm", "start"]

