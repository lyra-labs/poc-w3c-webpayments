export default class EncryptedCardResponse {
  constructor() {
    this.cardholderName = '';
    this.suffix = '';
    this.encryptedCardData = '';
  }

  toJSON() {
    return {
      cardholderName: this.cardholderName,
      suffix: this.suffix,
      encryptedCardData: this.encryptedCardData,
    };
  }
}
