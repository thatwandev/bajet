FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
