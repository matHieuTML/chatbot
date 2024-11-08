# Use an official Node.js image as the base
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the server runs on
EXPOSE 5000

# Start the server
CMD ["node", "main.js"]