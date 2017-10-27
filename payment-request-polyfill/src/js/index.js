import RSA from 'node-rsa';
import dialogPolyfill from 'dialog-polyfill';
import Dialog from './DOMElements/Dialog';
import {
  EncryptedCardData,
  EncryptedCardRequest,
  EncryptedCardResponse,
  PaymentResponse,
} from './PaymentRequestAPI';
import KeyProvider from './KeyProvider';
import '../scss/main.scss';

export default class PaymentRequest {
  static method = 'encrypted-card';

  constructor(methodData, details) {
    methodData = methodData.find(m => PaymentRequest.method === m.supportedMethods);
    if (methodData === undefined) {
      throw new Error('Unsupported payment method.');
    }

    this.keyProvider = new KeyProvider(methodData.data.keyProviderURL);
    this.encryptedCardRequest = new EncryptedCardRequest();
    this.encryptedCardData = new EncryptedCardData();
    this.details = details;
    this.currentStep = 1;

    this.encryptedCardRequest.supportedNetworks = methodData.data.supportedNetworks;
    this.encryptedCardRequest.supportedTypes = methodData.data.supportedTypes;
    this.encryptedCardRequest.keyProviderURL = methodData.data.keyProviderURL;
  }

  show() {
    return new Promise((resolve, reject) => {
      const cancelCallback = () => Dialog.close(reject);

      const payCallback = () => {
        if (!Dialog.checkInputs()) {
          return;
        }

        if (this.currentStep === 1) {
          this.encryptedCardData.cardNumber = Dialog.getInputValue('cardNumber').replace(/\s/g, '');
          this.encryptedCardData.cardholderName = Dialog.getInputValue('nameOnCard');
          this.encryptedCardData.expiryMonth = Dialog.getInputValue('expiryMonth');
          this.encryptedCardData.expiryYear = Dialog.getInputValue('expiryYear');
          this.encryptedCardData.billingAddress = Dialog.getInputValue('billingAddress');

          this.currentStep = 2;
          Dialog.askSecurityCode();
        } else if (this.currentStep === 2) {
          this.encryptedCardData.cardSecurityCode = Dialog.getInputValue('securityCode');
          Dialog.processing();

          this.keyProvider
            .getEncryptionKey()
            .then((res) => {
              const publicKey = Buffer.from(res.publicKey, 'base64').toString('utf8');
              const key = new RSA(publicKey);
              const encryptedCardData = key.encrypt(this.encryptedCardData.toJSON(), 'base64');

              const encryptedCardResponse = new EncryptedCardResponse();
              encryptedCardResponse.cardholderName = this.encryptedCardData.cardholderName;
              encryptedCardResponse.suffix = this.encryptedCardData.cardNumber.substr(-4);
              encryptedCardResponse.encryptedCardData = encryptedCardData;

              const paymentResponse = new PaymentResponse();
              paymentResponse.requestId = res.requestId;
              paymentResponse.methodName = PaymentRequest.method;
              paymentResponse.details = encryptedCardResponse;

              resolve(paymentResponse);
            })
            .catch(cancelCallback);
        }
      };

      const dialog = Dialog.build(
        this.encryptedCardRequest,
        this.details,
        payCallback,
        cancelCallback,
      );

      document.body.appendChild(dialog);
      dialogPolyfill.registerDialog(dialog);
      dialog.showModal();
    });
  }

  show3DS(details) {
    return new Promise((resolve, reject) => {
      Dialog.ask3DS(details, resolve, reject);
    });
  }

  static notify3DSDone(accepted) {
    Dialog.notify3DSDone(accepted);
  }
}
