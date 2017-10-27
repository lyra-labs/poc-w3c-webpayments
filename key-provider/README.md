# Key Provider

## Installation

`yarn install`

## Usage

### Production

`yarn start`

### Development

`yarn start:dev`

### Options

* `--hostname` : default is `0.0.0.0`
* `--port` : default is `9092`
* `--merchantHost` : default is `http://localhost:9093`
* `--backend` : default is `payzen`, available backends: `payzen`, `mock` (offline mode)

## API

### `GET /encryptionKey`

Returns the RSA public key to the Payment Request API for card data encryption.

##### Response

```javascript
{
  requestId: '123-456-789',
  publicKey: 'base64string...',
}
```

### `POST /payment`

Decrypts the card data and makes the payment to the registered payment backend server.

##### Request

```javascript
{
  amount: 1200, // $12.00
  currency: 840, // ISO 4217 code for USD
  encryptedCardData: 'base64string...',
}
```

##### Responses

```javascript
{
  status: 'OK',
}
```

or

```javascript
{
  status: 'KO',
  error: 'message...',
}
```

or

```javascript
{
  status: '3DS',
  details: {
    redirectUrl: 'http://...',
    pareq: '...',
    md: '...',
  }
}
```

### `GET /pendingKeys`

Returns generated private keys waiting for a payment.

##### Response

```javascript
{
  '<requestId>': 'base64string...',
  '<requestId>': 'base64string...',
  ...
}
```

### `POST /clearPendingKeys`

Clears generated private keys waiting for a payment.

### `GET /pendingPayments`

Returns payments awaiting for 3DS authentication.

##### Response

```javascript
{
  '<threeDSRequestId>': '{JSON workload}',
  '<threeDSRequestId>': '{JSON workload}',
  ...
}
```

### `POST /clearPendingPayments`

Clears payments awaiting for 3DS authentication.
