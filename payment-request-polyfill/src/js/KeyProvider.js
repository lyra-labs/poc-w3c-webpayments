export default class KeyProvider {
  constructor(url) {
    this.url = url;
  }

  obtainEncryptionKey(requestId) {
    return window
      .fetch(`${this.url}/${requestId}/obtainEncryptionKey`)
      .then(res => res.json());
  }
}
