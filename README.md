# Angular PWA Seed
A starter project for a PWA built in Angular 2+

## Install
`npm install` will download all dependencies needed for build and dev

## Scripts
- `npm run build` - transpile the server and compile the client
- `npm run buildssr` - transpile the server and compile the client for Angular Universal
- `npm run dev` - continously rebuilt and reloaded client and server
- `npm run devssr` - Build for SSR and rebuild on server changes
- `npm run clean` - removes the dist folder from previous builds
- `npm run test-client` - run karma for client-side tests
- `npm run test-client-dev` - run karma in watch-mode, re-running tests on save
- `npm run test-server` - run mocha tests against server
- `npm test` - run client and server tests once

## Compose
- `docker-compose rm -fs -v` - Destroy everything
- `docker-compose up -d mysql` - Start MySQL 5.7, with initial schema
- `docker-compose up --build pwa` - Build the dev Docker image.  This image is basic, just does `npm install`
- `docker-compose up pwa` - Just run `npm run dev` inside the dev container.  This mounts `$PWD` into the container so that code edits trigger gulp watcher.