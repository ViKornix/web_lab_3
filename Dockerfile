FROM node:22-slim as builder

WORKDIR /app

COPY packag*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-slim as runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.sequelizerc ./.sequelizerc
COPY --from=builder /app/src/db ./src/db

EXPOSE 4200

CMD ["node", "dist/main.js"]
