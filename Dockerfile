# Use a newer official Node.js image as a base
FROM node:20 as server

# Set the working directory for server-side code
WORKDIR /app

# Copy server-side code and dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your server code
COPY . .

# Expose the port that your app runs on
EXPOSE 3000

# Define the command to start the server
CMD ["npm", "run", "server"]
