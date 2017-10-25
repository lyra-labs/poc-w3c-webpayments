export default class KeyProvider {
  constructor(url) {
    this.url = url;
  }

  obtainEncryptionKey() {
    return window
      .fetch(`${this.url}/obtainEncryptionKey`)
      .then(res => res.json());
  }
}
