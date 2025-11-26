FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npx playwright install-deps
RUN npx playwright install chromium

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
