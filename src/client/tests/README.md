# Testing Guide

## Tools

- [Karma](https://github.com/karma-runner/karma)
- [Mocha](https://github.com/mochajs/mocha)
- [Chai](https://github.com/chaijs/chai)
- [Ts-Mockito](https://github.com/NagRock/ts-mockito)

## Config

`tsconfig.app.json` defines the tsconfig for the actual running application, but excludes tests for compile. `tsconfig.test.json` does not exclude tests and defines some testing types, but otherwise is identical. This is accomplished through both extending the base config: `tsconfig.json`. Any changes to the actual compiler options or configuration should be made there.

This means that when testing, the test runner must know about `tsconfig.test.json`. `webpack.config.test.ts` contains a simplified webpack config which uses the `tsconfig.test.json`. This webpack config is used by `karma`.

## Running tests

By default `npm test` will run `test-client` then `test-server`. To test one or the other, use `npm run test-client`, or `npm run test-server`.
