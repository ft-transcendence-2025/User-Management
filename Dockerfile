FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

ENV DOTENV_CONFIG_PATH=prisma/.env

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
