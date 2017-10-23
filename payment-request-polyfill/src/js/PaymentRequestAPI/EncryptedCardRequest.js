export default class EncryptedCardRequest {
  constructor() {
    this.supportedNetworks = [];
    this.supportedTypes = [];
    this.keyProviderURL = '';
  }

  toJSON() {
    return {
      supportedNetworks: this.supportedNetworks,
      supportedTypes: this.supportedTypes,
      keyProviderURL: this.keyProviderURL,
    };
  }
}
