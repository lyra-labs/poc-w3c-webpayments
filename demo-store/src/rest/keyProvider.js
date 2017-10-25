/* eslint-disable import/prefer-default-export */

import paymentMethod from '../resources/data/paymentMethod';

export function payment(requestId, body) {
  return window
    .fetch(`${paymentMethod.data.keyProviderURL}/payment?requestId=${requestId}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: new window.Headers({
        'Content-Type': 'application/json',
      }),
    })
    .then(res => res.json());
}
