# Use Node.js LTS version 22 with Debian Slim for better compatibility
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Install necessary build tools for native dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package.json and yarn.lock for dependency installation
COPY package.json yarn.lock ./

# Install all dependencies, including development dependencies
RUN yarn install

# Ensure local binaries (like tsx) are available in PATH
ENV PATH="./node_modules/.bin:${PATH}"

# Copy the rest of the application code
COPY . .

# Generate prisma client
RUN yarn prisma generate

# Build the application
RUN yarn build
RUN mkdir -p /app/dist/static
RUN mkdir -p /app/dist/temp
RUN mkdir -p /app/static
RUN mkdir -p /app/temp

# Expose the port your application runs on (adjust if necessary)
EXPOSE 3000

# Default command to start the application
CMD ["sh", "-c", "yarn run prisma db push && node dist/main.js"]

# Optional commands for development and linting
# To run in development mode: yarn dev
# To lint the code: yarn lint or yarn eslint

