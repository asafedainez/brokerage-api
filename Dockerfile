FROM node:16.15.1-alpine

WORKDIR /app

COPY package.json .

RUN yarn

RUN yarn generate

COPY . .

CMD ["yarn", "start"]