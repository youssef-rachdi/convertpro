# Use an official Node.js runtime as a parent image
FROM node:20

# Install ffmpeg for your media conversions
RUN apt-get update && apt-get install -y ffmpeg

# Add this to your Dockerfile to fix GLib errors on Linux
RUN apt-get update && apt-get install -y libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Create uploads and outputs folders
RUN mkdir -p uploads outputs && chmod 777 uploads outputs

# Expose the port your app runs on
EXPOSE 7860

# Set environment variable for the port (Hugging Face uses 7860)
ENV PORT=7860

# Start the application
CMD ["node", "server.js"]