FROM node:14 as builder

RUN mkdir /app && cd /app
WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
RUN yarn install

COPY src /app/src
COPY tsconfig.json /app/tsconfig.json

RUN yarn start
