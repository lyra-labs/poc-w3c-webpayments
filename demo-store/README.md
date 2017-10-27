# Demo Store

## Installation

Package `payment-request-polyfill` must be linked locally.

```
cd /path/to/payment-request-polyfill
yarn install
yarn build
yarn link
cd /path/to/demo-store
yarn install
yarn link payment-request-polyfill
```

## Usage

### Production

`yarn start`

### Development

`yarn start:dev`

### Options

* `--hostname` : default is `0.0.0.0`
* `--port` : default is `9093`
* `--keyProviderURL` : default is `http://localhost:9092`
* `--demoStoreURL` : default is `http://localhost:9093`
