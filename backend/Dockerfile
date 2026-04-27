FROM node:20-alpine
WORKDIR /app

# Installer les dépendances root (contient prisma CLI)
COPY package*.json ./
RUN npm install

# Installer les dépendances backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Installer ts-node-dev pour le mode watch
RUN cd backend && npm install ts-node-dev

# Copier le schéma Prisma et générer le client
COPY prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copier les fichiers de config TypeScript
COPY backend/tsconfig*.json ./backend/
COPY backend/nest-cli.json ./backend/

# Copier les sources (overridées par le volume mount en dev)
COPY backend/src ./backend/src

EXPOSE 3000

WORKDIR /app/backend

CMD ["sh", "-c", "npx prisma migrate deploy --schema=/app/prisma/schema.prisma && npm run start:dev"]
