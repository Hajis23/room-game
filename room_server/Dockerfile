FROM node:21-alpine3.17

WORKDIR /usr/src/app

COPY package* ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

CMD ["npm", "start"]
