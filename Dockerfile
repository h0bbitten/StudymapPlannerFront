# Use a newer official Node.js image as a base
FROM node:20

# Set the working directory inside the container to /node
WORKDIR /node

# Copy the package.json (and package-lock.json if available) from the root directory to the working directory
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the entire project into the /node directory
COPY . ./

# Expose the port the app runs on
EXPOSE 3000

# Define the command to start your server
CMD ["npm", "run", "server"]
