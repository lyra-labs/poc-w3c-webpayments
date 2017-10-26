import w3cLogo from '../../imgs/w3c-logo.png';
import DialogRow from './DialogRow';
import DialogOrderRow from './DialogOrderRow';
import DialogPaymentRow from './DialogPaymentRow';
import DialogCardsRow from './DialogCardsRow';
import DialogSecurityCodeRow from './DialogSecurityCodeRow';

export default class Dialog {
  static ID = '__prDialog';
  static PAYMENT_ACCEPTED = 'paymentAccepted';
  static PAYMENT_REFUSED = 'paymentRefused';

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

  static askSecurityCode() {
    const cardNumber = document.querySelector(`#${Dialog.ID} input[name="cardNumber"]`).value;

    // remove current content rows (order summary, payment data...)
    document.querySelectorAll(`.${DialogRow.CLASS}`).forEach(el => el.remove());

    const content = document.getElementById(`${Dialog.ID}_content`);
    const securityCodeRow = DialogSecurityCodeRow.build(cardNumber);
    content.appendChild(securityCodeRow);

    document.querySelector(`#${Dialog.ID} input`).focus();
  }

  static ask3DS(details, resolve, reject) {
    const root = Dialog.clear();
    root.addEventListener(Dialog.PAYMENT_ACCEPTED, resolve);
    root.addEventListener(Dialog.PAYMENT_REFUSED, reject);

    const iframe = document.createElement('iframe');
    iframe.id = `${Dialog.ID}_iframe`;

    // hack to keep loading wheel displayed until ACS form is loaded
    let loadCounter = 0;
    iframe.addEventListener('load', () => {
      if (loadCounter === 2) {
        root.className = '';
      }
      loadCounter += 1;
    });

    root.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const content = `
    <html>
    <body>
      <form name="3DSForm" method="post" action="${details.redirectUrl}">
        <input type="hidden" name="PaReq" value="${details.pareq}" />
        <input type="hidden" name="TermUrl" value="${details.termUrl}" />
        <input type="hidden" name="MD" value="${details.md}" />
      </form>
    </body>
    </html>
    `;

    doc.open();
    doc.write(content);
    doc.close();

    doc.forms['3DSForm'].submit();
  }

  static notify3DSDone(accepted) {
    const event = new window.Event(accepted ? Dialog.PAYMENT_ACCEPTED : Dialog.PAYMENT_REFUSED);
    window.parent.document.getElementById(Dialog.ID).dispatchEvent(event);
  }

  static processing() {
    const root = Dialog.clear();
    root.className = `${Dialog.ID}_spinner`;
  }

  static clear() {
    const root = document.getElementById(Dialog.ID);
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    return root;
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
}
