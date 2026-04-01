FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

RUN npm install

COPY src ./src

EXPOSE 5173

CMD ["npm", "run", "dev"]
