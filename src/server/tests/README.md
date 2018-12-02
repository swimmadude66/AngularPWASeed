# Testing Guide

## Tools

- [Mocha](https://github.com/mochajs/mocha) (with [ts-node](https://github.com/TypeStrong/ts-node)
- [Chai](https://github.com/chaijs/chai)
- [Ts-Mockito](https://github.com/NagRock/ts-mockito)
- [Supertest](https://github.com/visionmedia/supertest)

## Running tests

By default `npm test` will run `test-client` then `test-server`. To test one or the other, use `npm run test-client`, or `npm run test-server`.

## Test flow

Services and routes which do more than just proxy to another API need to be tested. Ideally, a route test should use supertest to hit the real API code, testing invalid as well as valid conditions.

Service tests should test any function which transforms or modifies data beyond serialization of a thrid party's output.






