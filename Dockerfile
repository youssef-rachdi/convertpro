FROM node:20

# Install all necessary system libraries in one clean layer
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy package files first for faster caching
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Create folders with full permissions
RUN mkdir -p uploads outputs && chmod -R 777 uploads outputs

EXPOSE 7860
ENV PORT=7860

# Use 'node' directly to ensure the process stays alive
CMD ["node", "server.js"]