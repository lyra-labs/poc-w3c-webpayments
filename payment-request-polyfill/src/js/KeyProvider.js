export default class KeyProvider {
  constructor(url) {
    this.url = url;
  }

  getEncryptionKey() {
    return window
      .fetch(`${this.url}/encryptionKey`)
      .then(res => res.json());
  }
}
