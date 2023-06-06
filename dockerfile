# Use the official Node.js image as the base
FROM node:19.8.1

# Set the working directory inside the Docker image
WORKDIR /A618-Assignment

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which your Node.js application listens
EXPOSE 4000

# Define the startup command for running the application
CMD ["node", "index.js"]
