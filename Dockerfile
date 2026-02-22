# Use an official Node.js runtime as a parent image
FROM node:20

# Install ffmpeg for your media conversions
RUN apt-get update && apt-get install -y ffmpeg

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