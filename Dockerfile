FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 5500

CMD ["node", "dist/main.js"]