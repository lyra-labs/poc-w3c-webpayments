import crypto from 'crypto';
import soap from 'soap';
import pymnt from 'payment';
import uuid from 'uuid/v5';

const cardArray = pymnt.getCardArray().map(card => ({
  ...card,
  pattern: (card.type === 'mastercard' ? /^5/ : card.pattern),
}));

pymnt.setCardArray(cardArray);

export default class PayZen {
  constructor() {
    this.config = {
      shopId: '90019748',
      certTest: '7434895189564142',
      ctxMode: 'TEST',
      wsdl: 'https://demo.payzen.eu/vads-ws/v5?wsdl',
      ns: 'http://v5.ws.vads.lyra.com/Header',
      uuidNamespace: '1546058f-5a25-4334-85ae-e68f2a44bbaf',
    };

    this.pendingPayments = {};
  }

  static buildCommonRequest(timestamp) {
    return {
      submissionDate: timestamp,
    };
  }

  static buildPaymentRequest(body) {
    return {
      amount: body.amount,
      currency: body.currency,
    };
  }

  static buildOrderRequest(requestId) {
    return {
      orderId: requestId,
    };
  }

  static buildCardRequest(cardData) {
    const cardType = pymnt.fns.cardType(cardData.cardNumber);

    return {
      number: cardData.cardNumber,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cardSecurityCode: cardData.cardSecurityCode,
      scheme: cardType ? cardType.toUpperCase() : '',
    };
  }

  static buildThreeDSRequest() {
    return {
      mode: 'ENABLED_CREATE',
    };
  }

  setSoapHeaders(client, timestamp) {
    const requestId = uuid(timestamp, this.config.uuidNamespace);

    const authToken = crypto
      .createHmac('sha256', this.config.certTest)
      .update(requestId + timestamp)
      .digest('base64');

    const headers = {
      requestId,
      timestamp,
      shopId: this.config.shopId,
      mode: this.config.ctxMode,
      authToken,
    };

    Object.keys(headers).forEach((key) => {
      client.addSoapHeader({ [key]: headers[key] }, '', 'soapHeader', this.config.ns);
    });
  }

  payment(res, requestId, body, cardData) {
    const timestamp = `${(new Date()).toISOString().split('.')[0]}Z`;

    let soapClient;
    let workload;

    if (requestId) {
      // first call to /payment
      workload = {
        commonRequest: PayZen.buildCommonRequest(timestamp),
        paymentRequest: PayZen.buildPaymentRequest(body),
        orderRequest: PayZen.buildOrderRequest(requestId),
        cardRequest: PayZen.buildCardRequest(cardData),
        threeDSRequest: PayZen.buildThreeDSRequest(),
      };
    } else {
      // second call to /payment (in case of 3DS)
      const threeDSRequestId = body.MD.split('+')[1];
      workload = this.pendingPayments[threeDSRequestId];
      workload.commonRequest.submissionDate = timestamp;
      workload.threeDSRequest.mode = 'ENABLED_FINALIZE';
      workload.threeDSRequest.requestId = threeDSRequestId;
      workload.threeDSRequest.pares = body.PaRes;
      delete this.pendingPayments[threeDSRequestId];
    }

    const options = {
      trace: 1,
      encoding: 'UTF-8',
    };

    soap
      .createClientAsync(this.config.wsdl, options)
      .then((client) => {
        soapClient = client;
        this.setSoapHeaders(client, timestamp);
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
          this.pendingPayments[authRequestData.threeDSRequestId] = workload;

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

  getPendingPayments() {
    return this.pendingPayments;
  }

  clearPendingPayments() {
    this.pendingPayments = {};
  }
}
