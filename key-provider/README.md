# Key Provider

## `GET /:requestId/obtainEncryptionKey`

Returns the RSA public key to the Payment Request API for card data encryption.

#### Response

```javascript
{
  requestId: '123-456-789',
  publicKey: 'base64string.....',
}
```

## `POST /:requestId/payment`

Decrypts the card data and makes the payment to the registered payment backend server.

#### Request

```javascript
{
  amount: 1200, // $12.00
  currency: 840, // ISO 4217 code for USD
  encryptedCardData: 'base64string.....',
}
```

#### Response

```javascript
{
  status: 'OK',
}
```
