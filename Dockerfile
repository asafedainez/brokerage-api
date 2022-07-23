FROM node:16.15.1-alpine

WORKDIR /app

COPY package.json .

RUN yarn

COPY . .

CMD ["yarn", "start"]