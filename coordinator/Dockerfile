FROM node:21-alpine3.17

WORKDIR /usr/src/app

COPY package* ./
RUN npm i

COPY . .

CMD ["npm", "run", "dev"]
