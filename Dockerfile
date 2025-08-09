# Step 1: Use Node.js base image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY src/prisma ./prisma


RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main"]
