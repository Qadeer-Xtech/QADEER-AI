# Step 1: Base Image
FROM node:18-slim

# Step 2: Install necessary OS packages for Baileys
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    webp \
    && rm -rf /var/lib/apt/lists/*

# Step 3: Set working directory
WORKDIR /root/qadeer_bot

# Step 4: Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Step 5: Copy all your bot's source code
COPY . .

# Step 6: Define the command to run your bot
CMD ["node", "control.js"]
