FROM node:21-alpine3.17

COPY package.json app/package.json

WORKDIR app
RUN npm install
COPY . .
CMD ["node", "index.js"]
