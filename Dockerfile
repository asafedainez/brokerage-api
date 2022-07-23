FROM node:16.15.1-alpine

WORKDIR /app

COPY package.json .

RUN yarn

COPY . .

RUN yarn generate

CMD ["yarn", "start"]