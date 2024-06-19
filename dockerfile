# Use the official Node.js image from the Docker Hub
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies
RUN npm install --production || cat /root/.npm/_logs/*-debug-0.log

# Ensure bcrypt is rebuilt for the correct architecture
RUN npm rebuild bcrypt --build-from-source

# Copy local code to the container image.
COPY . .

# Debugging step to ensure files are copied correctly
RUN ls -R /usr/src/app/public

# Expose the port on which the app runs
EXPOSE 3000

# Run the web service on container startup.
CMD [ "node", "index.js" ]
