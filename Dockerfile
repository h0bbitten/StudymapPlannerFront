# Use the official Node.js image as a base for both server and client
FROM node:14 AS server

# Set the working directory for server-side code
#There is none. 

# Copy server-side code and dependencies
#COPY server/package*.json ./
RUN npm install
#COPY server/ ./

# Set up client-side code (assuming client directory is not used)
# FROM node:14 AS client
# WORKDIR /app/client
# COPY client/package*.json ./
# RUN npm install
# COPY client/ ./

# Combine server and client into a single image
FROM node:14

# Set the working directory for the app
#WORKDIR /app

# Copy server code from the server stage
#COPY --from=server /app/server /app/server

# Expose the port for the server
EXPOSE 3000

# Define the command to start the server
CMD ["node", "server.js"]  # Assuming server.js is the entry point for your server code
