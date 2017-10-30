import payment from 'payment';

const cardArray = payment.getCardArray().map(card => ({
  ...card,
  pattern: (card.type === 'mastercard' ? /^5/ : card.pattern),
}));

payment.setCardArray(cardArray);

export default {
  payment,
};
