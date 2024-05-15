# Use the official Node.js image from the Docker Hub
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Ensure bcrypt is rebuilt for the correct architecture
RUN npm rebuild bcrypt --build-from-source

# Copy local code to the container image.
COPY . .

# Expose the port on which the app runs
EXPOSE 3000

# Run the web service on container startup.
CMD [ "node", "index.js" ]
