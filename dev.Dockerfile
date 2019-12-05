FROM node:10-buster

ARG BUILD_VERSION=local
ARG environment_name=production
ENV BUILD_MODE=$environment_name
ENV DOCKER_MODE=true

WORKDIR /build
COPY . /build

RUN npm install 


