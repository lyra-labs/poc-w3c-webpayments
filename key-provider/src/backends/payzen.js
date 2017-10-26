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

// in-memory store of pending payments
const pendingPayments = {};

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

export function payment(req, res, requestId, cardData) {
  const timestamp = `${(new Date()).toISOString().split('.')[0]}Z`;

  let soapClient;
  let workload;

  if (requestId) {
    // first call to /payment
    workload = {
      commonRequest: buildCommonRequest(timestamp),
      paymentRequest: buildPaymentRequest(req.body),
      orderRequest: buildOrderRequest(requestId),
      cardRequest: buildCardRequest(cardData),
      threeDSRequest: buildThreeDSRequest(),
    };
  } else {
    // second call to /payment (in case of 3DS)
    const threeDSRequestId = req.body.MD.split('+')[1];
    workload = pendingPayments[threeDSRequestId];
    workload.commonRequest.submissionDate = timestamp;
    workload.threeDSRequest.mode = 'ENABLED_FINALIZE';
    workload.threeDSRequest.requestId = threeDSRequestId;
    workload.threeDSRequest.pares = req.body.PaRes;
    delete pendingPayments[threeDSRequestId];
  }

  const options = {
    trace: 1,
    encoding: 'UTF-8',
  };

  soap
    .createClientAsync(payzenConfig.wsdl, options)
    .then((client) => {
      soapClient = client;
      setSoapHeaders(client, timestamp);
      return client.createPaymentAsync(workload);
    })
    .then((result) => {
      const { commonResponse, threeDSResponse } = result.createPaymentResult;
      const authRequestData = threeDSResponse.authenticationRequestData;

      if (commonResponse.responseCode !== 0) {
        throw new Error(commonResponse.responseCodeDetail);
      }

      if (commonResponse.transactionStatusLabel === 'AUTHORISED') {
        return res.json({ status: 'OK' });
      }

      if (authRequestData && authRequestData.threeDSEnrolled === 'Y') {
        const setCookie = soapClient.lastResponseHeaders['set-cookie'];
        const sessionID = setCookie[0].match(/JSESSIONID=([A-Za-z0-9.]+)/)[1];

        // save workload for next call to /payment
        pendingPayments[authRequestData.threeDSRequestId] = workload;

        // need 3DS authentication
        return res.json({
          status: '3DS',
          details: {
            redirectUrl: `${authRequestData.threeDSAcsUrl};jsessionid=${sessionID}`,
            pareq: authRequestData.threeDSEncodedPareq,
            md: `${sessionID}+${authRequestData.threeDSRequestId}`,
          },
        });
      }

      return res.json({
        status: 'KO',
        error: 'Payment declined',
      });
    })
    .catch((err) => {
      res.json({
        status: 'KO',
        error: err.message ? err.message : undefined,
      });

      if (err.body) {
        throw new Error(err.body);
      }
    });
}
