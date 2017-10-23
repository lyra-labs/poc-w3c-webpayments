export default class EncryptedCardData {
  constructor() {
    this.cardNumber = '';
    this.cardholderName = '';
    this.cardSecurityCode = '';
    this.expiryMonth = '';
    this.expiryYear = '';
    this.billingAddress = '';
  }

  toJSON() {
    return {
      cardNumber: this.cardNumber,
      cardholderName: this.cardholderName,
      cardSecurityCode: this.cardSecurityCode,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      billingAddress: this.billingAddress,
    };
  }
}
