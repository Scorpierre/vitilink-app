FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Installer les dépendances backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copier les fichiers backend
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./
COPY backend/src ./src

# Copier prisma racine dans /app/prisma
WORKDIR /app
COPY prisma ./prisma

# Générer Prisma client avec le bon schema
WORKDIR /app/backend
RUN npm run prisma:generate

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:generate && npm run prisma:deploy && npm run start:dev"]