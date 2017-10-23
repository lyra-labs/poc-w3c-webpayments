import * as currencyFormatter from 'currency-formatter';
import DialogRow from './DialogRow';

export default class DialogOrderRow extends DialogRow {
  static ID = '__prDialogOrderRow';

  static buildPaymentItem(paymentItem, isTotal) {
    const amount = currencyFormatter.format(paymentItem.amount.value, {
      code: paymentItem.amount.currency,
    });

    const paymentItemDiv = document.createElement('div');
    paymentItemDiv.className = `${DialogOrderRow.ID}_paymentItem`;

    const labelDiv = document.createElement('div');
    labelDiv.className = `${DialogOrderRow.ID}_paymentItem_label`;
    labelDiv.appendChild(document.createTextNode(paymentItem.label));
    paymentItemDiv.appendChild(labelDiv);

    if (isTotal) {
      const currencyDiv = document.createElement('div');
      currencyDiv.className = `${DialogOrderRow.ID}_paymentItem_currency`;
      currencyDiv.appendChild(document.createTextNode(paymentItem.amount.currency));
      paymentItemDiv.appendChild(currencyDiv);
    }

    const amountDiv = document.createElement('div');
    amountDiv.className = `${DialogOrderRow.ID}_paymentItem_amount`;
    amountDiv.appendChild(document.createTextNode(amount));
    paymentItemDiv.appendChild(amountDiv);

    if (isTotal) {
      paymentItemDiv.classList.add(`${DialogOrderRow.ID}_paymentItem_bold`);
    }

    return paymentItemDiv;
  }

  static build(details) {
    const dialogRow = super.build('Order summary');
    dialogRow.id = DialogOrderRow.ID;

    const contentDiv = document.createElement('div');
    contentDiv.className = `${DialogRow.CLASS}_content`;

    details.displayItems.forEach((paymentItem) => {
      contentDiv.appendChild(DialogOrderRow.buildPaymentItem(paymentItem, false));
    });

    contentDiv.appendChild(DialogOrderRow.buildPaymentItem(details.total, true));

    dialogRow.appendChild(contentDiv);

    return dialogRow;
  }
}
