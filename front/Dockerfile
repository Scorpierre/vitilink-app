FROM node:20-alpine
WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier les fichiers de config
COPY svelte.config.js vite.config.ts tsconfig.json postcss.config.js tailwind.config.js ./

# Copier les sources et assets (overridés par le volume mount en dev)
COPY src ./src
COPY static ./static

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
