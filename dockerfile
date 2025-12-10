FROM node:25-alpine3.22

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./


RUN npm install

COPY . .

# RUN npx prisma generate

EXPOSE 3001