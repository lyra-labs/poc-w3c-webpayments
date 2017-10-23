import DialogRow from './DialogRow';
import Cards from '../../json/registeredCards.json';

export default class DialogCardsRow extends DialogRow {
  static ID = '__prDialogCardsRow';

  static buildSelect() {
    const setInputValue = (inputName, value) => {
      const el = document.querySelector(`.__prDialogPaymentRow_formRow [name="${inputName}"]`);
      el.value = value;
      el.dispatchEvent(new window.Event('input'));
    };

    const select = document.createElement('select');

    select.onchange = (e) => {
      const card = Cards[e.target.value];
      setInputValue('cardNumber', card.cardNumber);
      setInputValue('nameOnCard', card.nameOnCard);
      setInputValue('expiryMonth', card.expiryMonth);
      setInputValue('expiryYear', card.expiryYear);
      setInputValue('billingAddress', card.billingAddress);
    };

    Object.keys(Cards).forEach((card) => {
      const option = document.createElement('option');
      option.setAttribute('value', card);
      option.appendChild(document.createTextNode(card));
      select.appendChild(option);
    });

    return select;
  }

  static build() {
    const dialogRow = super.build('Registered cards');
    dialogRow.id = DialogCardsRow.ID;

    const contentDiv = document.createElement('div');
    contentDiv.className = `${DialogRow.CLASS}_content`;

    const select = DialogCardsRow.buildSelect();
    contentDiv.appendChild(select);

    dialogRow.appendChild(contentDiv);

    return dialogRow;
  }
}
