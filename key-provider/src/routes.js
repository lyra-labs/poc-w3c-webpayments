import RSA from 'node-rsa';
import minimist from 'minimist';
import * as backends from './backends';

const FORMAT_PUBLIC = 'pkcs1-public';
const DEFAULT_BACKEND = 'payzen';

const argv = minimist(process.argv.slice(2));
const backend = argv.backend ? argv.backend : DEFAULT_BACKEND;
const keys = {};

// GET /:requestId/obtainEncryptionKey
export function obtainEncryptionKey(req, res) {
  const { requestId } = req.params;
  const key = new RSA({ b: 1024 });

  keys[requestId] = key;

  res.send({
    requestId,
    publicKey: Buffer.from(key.exportKey(FORMAT_PUBLIC)).toString('base64'),
  });
}

// POST /:requestId/payment
export function payment(req, res) {
  const { requestId } = req.params;
  const key = keys[requestId];
  const cardData = key.decrypt(req.body.encryptedCardData, 'json');

  backends[backend].payment(requestId, req.body, cardData, res);
}
