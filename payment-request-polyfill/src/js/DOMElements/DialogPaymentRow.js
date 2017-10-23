import payment from 'payment';
import DialogRow from './DialogRow';
import * as cards from '../../imgs/networks';

export default class DialogPaymentRow extends DialogRow {
  static ID = '__prDialogPaymentRow';

  static buildNetworks(networks) {
    const networksDiv = document.createElement('div');

    const labelDiv = document.createElement('div');
    labelDiv.id = `${DialogPaymentRow.ID}_networksLabel`;
    labelDiv.appendChild(document.createTextNode('Accepted cards'));
    networksDiv.appendChild(labelDiv);

    const cardList = document.createElement('div');
    cardList.id = `${DialogPaymentRow.ID}_networksList`;
    networks.filter(network => cards[network]).forEach((network) => {
      const cardImg = document.createElement('img');
      cardImg.id = `${DialogPaymentRow.ID}_card_${network}`;
      cardImg.setAttribute('src', cards[network]);
      cardImg.setAttribute('title', network);
      cardImg.setAttribute('alt', network);
      cardList.appendChild(cardImg);
    });

    networksDiv.appendChild(cardList);

    return networksDiv;
  }

  static buildFormRow(label, isRequired) {
    const formRow = document.createElement('div');
    formRow.className = `${DialogPaymentRow.ID}_formRow`;

    const formLabel = document.createElement('div');
    formLabel.className = `${DialogPaymentRow.ID}_formRow_label`;
    formLabel.appendChild(document.createTextNode(label + (isRequired ? '*' : '')));
    formRow.appendChild(formLabel);

    return formRow;
  }

  static buildTextInput(label, isRequired, inputName) {
    const inputRow = DialogPaymentRow.buildFormRow(label, isRequired);

    const inputContainer = document.createElement('div');
    inputContainer.className = `${DialogPaymentRow.ID}_formRow_input`;

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', inputName);
    input.setAttribute('autocomplete', 'off');

    if (inputName === 'cardNumber') {
      // init cards array
      const cardArray = payment.getCardArray()
        .map((c) => {
          c.type = (c.type === 'dinersclub' ? 'diners' : c.type);
          c.pattern = (c.type === 'mastercard' ? /^5/ : c.pattern);
          return c;
        })
        .filter(c => Object.keys(cards).indexOf(c.type) > -1);
      payment.setCardArray(cardArray);

      // init input formatter
      payment.formatCardNumber(input);

      // init card highlighting
      input.addEventListener('input', (e) => {
        const cardType = payment.fns.cardType(e.target.value);
        const networks = document.querySelectorAll(`#${DialogPaymentRow.ID}_networksList > img`);
        networks.forEach((network) => {
          network.style.opacity = (cardType ? 0.35 : 1);
        });
        if (cardType) {
          document.querySelector(`#${DialogPaymentRow.ID}_card_${cardType}`).style.opacity = 1;
        }
      });
    }

    inputContainer.appendChild(input);
    inputRow.appendChild(inputContainer);

    return inputRow;
  }

  static buildExpiry() {
    const buildOption = (label, value) => {
      const option = document.createElement('option');
      option.setAttribute('value', value);
      option.appendChild(document.createTextNode(label));
      return option;
    };

    const inputRow = DialogPaymentRow.buildFormRow('Expiration date', true);

    const inputContainer = document.createElement('div');
    inputContainer.className = `${DialogPaymentRow.ID}_formRow_input`;

    const selectMonth = document.createElement('select');
    selectMonth.setAttribute('name', 'expiryMonth');
    selectMonth.appendChild(buildOption('Month', ''));
    for (let month = 1; month <= 12; month += 1) {
      const value = (month < 10 ? '0' : '') + month;
      selectMonth.appendChild(buildOption(value, value));
    }
    inputContainer.appendChild(selectMonth);

    const selectYear = document.createElement('select');
    selectYear.setAttribute('name', 'expiryYear');
    selectYear.appendChild(buildOption('Year', ''));
    for (let year = 17; year <= 26; year += 1) {
      const value = `20${year}`;
      selectYear.appendChild(buildOption(value, value));
    }
    inputContainer.appendChild(selectYear);

    inputRow.appendChild(inputContainer);

    return inputRow;
  }

  static buildForm() {
    const form = document.createElement('div');

    // build "card number" row
    const cardNumberRow = DialogPaymentRow.buildTextInput('Card number', true, 'cardNumber');
    form.appendChild(cardNumberRow);

    // build "name on card" row
    const nameRow = DialogPaymentRow.buildTextInput('Name on card', true, 'nameOnCard');
    form.appendChild(nameRow);

    // build "expiration date" row
    const expiryRow = DialogPaymentRow.buildExpiry();
    form.appendChild(expiryRow);

    // build "billing address" row
    const addrRow = DialogPaymentRow.buildTextInput('Billing address', true, 'billingAddress');
    form.appendChild(addrRow);

    // field is required
    const hintDiv = document.createElement('div');
    hintDiv.id = `${DialogPaymentRow.ID}_hint`;
    hintDiv.appendChild(document.createTextNode('* Field is required'));
    form.appendChild(hintDiv);

    return form;
  }

  static build(encryptedCardRequest) {
    const dialogRow = super.build('Payment');
    dialogRow.id = DialogPaymentRow.ID;

    const contentDiv = document.createElement('div');
    contentDiv.className = `${DialogRow.CLASS}_content`;

    const networksDiv = DialogPaymentRow.buildNetworks(encryptedCardRequest.supportedNetworks);
    contentDiv.appendChild(networksDiv);

    const formDiv = DialogPaymentRow.buildForm();
    contentDiv.appendChild(formDiv);

    dialogRow.appendChild(contentDiv);

    return dialogRow;
  }
}
