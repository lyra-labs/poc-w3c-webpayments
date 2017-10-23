import Dialog from '../DOMElements/Dialog';
import EncryptedCardResponse from './EncryptedCardResponse';

export default class PaymentResponse {
  constructor() {
    this.requestId = '';
    this.methodName = '';
    this.details = new EncryptedCardResponse();
    this.payerName = '';
    this.payerEmail = '';
    this.payerPhone = '';
  }

  toJSON() {
    return {
      requestId: this.requestId,
      methodName: this.methodName,
      details: this.details.toJSON(),
      payerName: this.payerName,
      payerEmail: this.payerEmail,
      payerPhone: this.payerPhone,
    };
  }

  complete() {
    return new Promise((resolve) => {
      Dialog.close();
      resolve();
    });
  }
}
