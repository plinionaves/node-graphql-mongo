FROM node:12.18.4-alpine AS dev-stage

WORKDIR /usr/app

COPY package*.json ./

RUN npm i

COPY . .


FROM dev-stage AS build-stage

ARG NODE_OPTIONS

RUN npm run build

RUN npm config set unsafe-perm true

RUN npm i -g pm2@4