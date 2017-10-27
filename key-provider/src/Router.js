import RSA from 'node-rsa';
import uuid from 'uuid';
import config from './config';
import backends from './backends';

export default class Router {
  static KEY_FORMAT_PUBLIC = 'pkcs1-public';
  static KEY_FORMAT_PRIVATE = 'pkcs1-private';

  constructor() {
    const Backend = backends[config.backend];
    if (!Backend) {
      throw new Error(`backend ${config.backend} does not exist`);
    }

    this.backend = new Backend();
    this.privateKeys = {};
  }

  /**
   * GET /encryptionKey
   */
  getEncryptionKey(req, res) {
    const requestId = uuid();
    const key = new RSA({ b: 1024 });
    const publicKey = Buffer.from(key.exportKey(Router.KEY_FORMAT_PUBLIC)).toString('base64');

    // save private key for next call to /payment
    this.privateKeys[requestId] = key.exportKey(Router.KEY_FORMAT_PRIVATE);

    res.json({ requestId, publicKey });
  }

  /**
   * POST /payment
   *
   * first call to /payment with requestId
   * in case of 3DS payment, second call to /payment without requestId
   */
  payment(req, res) {
    const { requestId } = req.query;
    const body = JSON.parse(req.body);
    let cardData;

    // check mandatory body fields
    const fields = requestId ? ['amount', 'currency', 'encryptedCardData'] : ['MD', 'PaRes'];
    if (!fields.every(field => body[field])) {
      return res.status(400).json({ error: 'missing property in JSON body' });
    }

    if (requestId) {
      if (!this.privateKeys[requestId]) {
        return res.status(400).json({ error: `requestId ${requestId} not found` });
      }

      // decrypt card data
      const key = new RSA(this.privateKeys[requestId]);
      cardData = key.decrypt(body.encryptedCardData, 'json');
      delete this.privateKeys[requestId];
    }

    // call payment on the specified backend
    return this.backend.payment(res, requestId, body, cardData);
  }

  /**
   * GET /pendingKeys
   */
  getPendingKeys(req, res) {
    res.json(this.privateKeys);
  }

  /**
   * POST /clearPendingKeys
   */
  clearPendingKeys(req, res) {
    this.privateKeys = {};
    res.status(204).end();
  }

  /**
   * GET /pendingPayments
   */
  getPendingPayments(req, res) {
    res.json(this.backend.getPendingPayments());
  }

  /**
   * POST /clearPendingPayments
   */
  clearPendingPayments(req, res) {
    this.backend.clearPendingPayments();
    res.status(204).end();
  }
}
