FROM node:18-alpine

# Set working directory
WORKDIR /var/www

# Copy package files
COPY package*.json ./
COPY .npmrc .

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start application
CMD ["npm", "run", "dev"]
