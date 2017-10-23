/* eslint-disable import/prefer-default-export */

import crypto from 'crypto';
import config from 'config';
import soap from 'soap';
import pymnt from 'payment';
import uuid from 'uuid/v5';

const payzenConfig = config.backends.payzen;

const cardArray = pymnt.getCardArray().map(card => ({
  ...card,
  pattern: (card.type === 'mastercard' ? /^5/ : card.pattern),
}));

pymnt.setCardArray(cardArray);

function buildCommonRequest(timestamp) {
  return {
    submissionDate: timestamp,
  };
}

function buildPaymentRequest(body) {
  return {
    amount: body.amount,
    currency: body.currency,
  };
}

function buildOrderRequest(requestId) {
  return {
    orderId: requestId,
  };
}

function buildCardRequest(cardData) {
  const cardType = pymnt.fns.cardType(cardData.cardNumber);

  return {
    number: cardData.cardNumber,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    cardSecurityCode: cardData.cardSecurityCode,
    scheme: cardType ? cardType.toUpperCase() : '',
  };
}

function buildThreeDSRequest() {
  return {
    mode: 'ENABLED_CREATE',
  };
}

function setSoapHeaders(client, timestamp) {
  const requestId = uuid(timestamp, payzenConfig.uuidNamespace);

  const authToken = crypto
    .createHmac('sha256', payzenConfig.certTest)
    .update(requestId + timestamp)
    .digest('base64');

  const headers = {
    requestId,
    timestamp,
    shopId: payzenConfig.shopId,
    mode: payzenConfig.ctxMode,
    authToken,
  };

  Object.keys(headers).forEach((key) => {
    client.addSoapHeader({ [key]: headers[key] }, '', 'soapHeader', payzenConfig.ns);
  });
}

export function payment(requestId, body, cardData, res) {
  const timestamp = `${(new Date()).toISOString().split('.')[0]}Z`;

  const options = {
    trace: 1,
    encoding: 'UTF-8',
  };

  const workload = {
    commonRequest: buildCommonRequest(timestamp),
    paymentRequest: buildPaymentRequest(body),
    orderRequest: buildOrderRequest(requestId),
    cardRequest: buildCardRequest(cardData),
    threeDSRequest: buildThreeDSRequest(),
  };

  soap
    .createClientAsync(payzenConfig.wsdl, options)
    .then((client) => {
      setSoapHeaders(client, timestamp);
      return client.createPaymentAsync(workload);
    })
    .then((result) => {
      const { commonResponse } = result.createPaymentResult;

      if (commonResponse.responseCode !== 0) {
        throw new Error(commonResponse.responseCodeDetail);
      }

      if (commonResponse.transactionStatusLabel === 'AUTHORISED') {
        return res.json({ status: 'OK' });
      }

      // TODO: handle 3DS here

      return res.json({ status: 'KO' });
    })
    .catch((err) => {
      res.json({ status: 'KO' });
      throw new Error(err.body ? err.body : err.message);
    });
}
