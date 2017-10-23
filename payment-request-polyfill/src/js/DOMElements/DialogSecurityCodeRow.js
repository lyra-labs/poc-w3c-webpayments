import payment from 'payment';
import Utils from '../Utils';
import cvc from '../../imgs/cvc.png';

export default class DialogSecurityCodeRow {
  static ID = '__prDialogSecurityCodeRow';

  static build(cardNumber) {
    const dialogRow = document.createElement('div');
    dialogRow.id = DialogSecurityCodeRow.ID;

    const titleDiv = document.createElement('h4');
    const cardType = Utils.ucfirst(payment.fns.cardType(cardNumber));
    const title = `Enter the CVC for ${cardType} \xa0• • • • ${cardNumber.substr(-4)}`;
    titleDiv.appendChild(document.createTextNode(title));
    dialogRow.appendChild(titleDiv);

    const messageDiv = document.createElement('p');
    const message = 'Once you confirm, your card details will be shared with this site.';
    messageDiv.appendChild(document.createTextNode(message));
    dialogRow.appendChild(messageDiv);

    const securityCodeDiv = document.createElement('div');
    const icon = document.createElement('img');
    icon.setAttribute('src', cvc);
    icon.setAttribute('alt', 'CVC');
    securityCodeDiv.appendChild(icon);
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('name', 'securityCode');
    input.setAttribute('placeholder', 'CVC');
    securityCodeDiv.appendChild(input);
    dialogRow.appendChild(securityCodeDiv);

    return dialogRow;
  }
}
