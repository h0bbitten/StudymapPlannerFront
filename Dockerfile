# Use the official Node.js image as a base for both server and client
FROM node:14 AS server

# Set the working directory for server-side code
WORKDIR /app/server

# Copy server-side code and dependencies
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Set up client-side code
FROM node:14 AS client

# Set the working directory for client-side code
WORKDIR /app/client

# Copy client-side code and dependencies
COPY client/package*.json ./
RUN npm install
COPY client/ ./

# Combine server and client into a single image
FROM node:14

# Set the working directory for the app
WORKDIR /app

# Copy server and client code from separate stages
COPY --from=server /app/server /app/server
COPY --from=client /app/client /app/client

# Expose the port for the server
EXPOSE 3000

# Define the command to start the server
CMD ["node", "server/index.js"]
