FROM alpine:3.8

ARG BUILD_VERSION=local
ARG environment_name=production
ENV BUILD_MODE=$environment_name
ENV DOCKER_MODE=true

WORKDIR /build
COPY . /build

RUN echo "Build Mode: ${BUILD_MODE}, Build Version: ${BUILD_VERSION}" \
&& apk add --no-cache --update \
nodejs \
nodejs-npm \
chromium \
&& export CHROME_BIN=/usr/bin/chromium-browser \
&& npm install \
&& npm test \
&& apk del \
chromium \
&& npm run build \
&& mkdir -p -m 0777 /app/dist \
&& cp -R dist/* /app/dist \
&& cp package.json /app \
&& cd /app \
&& echo "{\"date\": \"`date`\", \"version\":\"$BUILD_VERSION\"}" > /app/dist/server/version.json \
&& npm i --only="prod" \
&& rm -rf /build /app/package-lock.json \
&& npm cache clean --force

WORKDIR /app

ENTRYPOINT npm start
