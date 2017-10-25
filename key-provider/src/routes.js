import RSA from 'node-rsa';
import uuid from 'uuid';
import minimist from 'minimist';
import * as backends from './backends';

const FORMAT_PUBLIC = 'pkcs1-public';
const FORMAT_PRIVATE = 'pkcs1-private';
const DEFAULT_BACKEND = 'payzen';

const argv = minimist(process.argv.slice(2));
const backend = argv.backend ? argv.backend : DEFAULT_BACKEND;
if (!backends[backend]) {
  throw new Error(`backend ${backend} does not exist`);
}

// in-memory store of private keys
const privateKeys = {};

// GET /obtainEncryptionKey
export function obtainEncryptionKey(req, res) {
  const key = new RSA({ b: 1024 });
  const requestId = uuid();

  privateKeys[requestId] = key.exportKey(FORMAT_PRIVATE);

  res.send({
    requestId,
    publicKey: Buffer.from(key.exportKey(FORMAT_PUBLIC)).toString('base64'),
  });
}

// POST /payment
export function payment(req, res) {
  const { requestId } = req.query;

  if (requestId) {
    const key = new RSA(privateKeys[requestId]);
    const cardData = key.decrypt(req.body.encryptedCardData, 'json');
    backends[backend].payment(req, res, requestId, cardData);
    delete privateKeys[requestId];
  } else {
    backends[backend].payment(req, res);
  }
}
