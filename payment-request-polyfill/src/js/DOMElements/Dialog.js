import w3cLogo from '../../imgs/w3c-logo.png';
import DialogRow from './DialogRow';
import DialogOrderRow from './DialogOrderRow';
import DialogPaymentRow from './DialogPaymentRow';
import DialogCardsRow from './DialogCardsRow';
import DialogSecurityCodeRow from './DialogSecurityCodeRow';

export default class Dialog {
  static ID = '__prDialog';

  static close(callback) {
    document.getElementById(Dialog.ID).classList.add(`${Dialog.ID}_hide`);
    setTimeout(() => {
      document.getElementById(Dialog.ID).remove();
      if (callback) {
        callback();
      }
    }, 100); // must be synced with CSS animation
  }

  static buildHeader() {
    const header = document.createElement('header');
    header.appendChild(document.createTextNode('Your Payment'));

    return header;
  }

  static buildContent(encryptedCardRequest, details) {
    const content = document.createElement('div');
    content.id = `${Dialog.ID}_content`;

    const orderRow = DialogOrderRow.build(details);
    content.appendChild(orderRow);

    const cardsRow = DialogCardsRow.build();
    content.appendChild(cardsRow);

    const paymentRow = DialogPaymentRow.build(encryptedCardRequest);
    content.appendChild(paymentRow);

    return content;
  }

  static buildFooter(payCallback, cancelCallback) {
    const footer = document.createElement('footer');

    const logo = document.createElement('img');
    logo.setAttribute('src', w3cLogo);
    logo.setAttribute('alt', 'W3C logo');

    const logoContainer = document.createElement('div');
    logoContainer.appendChild(logo);
    footer.appendChild(logoContainer);

    const payButton = document.createElement('button');
    payButton.appendChild(document.createTextNode('Pay'));
    payButton.id = `${Dialog.ID}_payButton`;
    payButton.onclick = payCallback;
    footer.appendChild(payButton);

    const cancelButton = document.createElement('button');
    cancelButton.appendChild(document.createTextNode('Cancel'));
    cancelButton.onclick = cancelCallback;
    footer.appendChild(cancelButton);

    return footer;
  }

  static build(encryptedCardRequest, details, payCallback, cancelCallback) {
    const oldDialog = document.getElementById(Dialog.ID);
    if (oldDialog) {
      oldDialog.remove();
    }

    const dialog = document.createElement('dialog');
    dialog.id = Dialog.ID;

    dialog.appendChild(Dialog.buildHeader());
    dialog.appendChild(Dialog.buildContent(encryptedCardRequest, details));
    dialog.appendChild(Dialog.buildFooter(payCallback, cancelCallback));

    return dialog;
  }

  static checkInputs() {
    const errorClass = '__prDialogInputError';
    let result = true;

    document.querySelectorAll(`#${Dialog.ID} input, #${Dialog.ID} select`).forEach((el) => {
      if (!el.value) {
        el.classList.add(errorClass);
        result = false;
      } else {
        el.classList.remove(errorClass);
      }
    });

    return result;
  }

  static getInputValue(inputName) {
    return document.querySelector(`#${Dialog.ID} [name="${inputName}"]`).value;
  }

  static askSecurityCode() {
    const cardNumber = document.querySelector(`#${Dialog.ID} input[name="cardNumber"]`).value;

    // remove current content rows (order summary, payment data...)
    document.querySelectorAll(`.${DialogRow.CLASS}`).forEach(el => el.remove());

    const content = document.getElementById(`${Dialog.ID}_content`);
    const securityCodeRow = DialogSecurityCodeRow.build(cardNumber);
    content.appendChild(securityCodeRow);

    document.querySelector(`#${Dialog.ID} input`).focus();
  }

  static processing() {
    // clear dialog
    const root = document.getElementById(Dialog.ID);
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    // display loading spinner
    root.classList.add(`${Dialog.ID}_spinner`);
  }
}
