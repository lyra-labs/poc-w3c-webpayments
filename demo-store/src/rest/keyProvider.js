/* eslint-disable import/prefer-default-export */

import paymentMethod from '../resources/config/paymentMethod.json';

export function payment(requestId, body) {
  return window
    .fetch(`${paymentMethod.data.keyProviderURL}/${requestId}/payment`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: new window.Headers({
        'Content-Type': 'application/json',
      }),
    })
    .then(res => res.json());
}
