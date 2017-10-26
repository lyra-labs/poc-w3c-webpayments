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
* `--port` : default is `3042`
* `--merchantHost` : default is `http://localhost:3000`

## API

### `GET /obtainEncryptionKey`

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
