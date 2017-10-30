/* eslint-disable class-methods-use-this */
import config from '../config';

export default class Mock {
  static cardStatus = {
    5970100300000042: 'OK',
    5970100300000026: '3DS',
    5970100300000083: 'KO',
    4970100000000048: 'OK',
    4970100000000022: '3DS',
    4970100000000071: 'KO',
  };

  static AcsCode = '123456';

  payment(res, requestId, body, cardData) {
    const result = { status: 'OK' };
    let timeout = 1500;

    if (requestId) {
      result.status = Mock.cardStatus[cardData.cardNumber] || 'OK';
      if (result.status === '3DS') {
        result.details = {
          redirectUrl: `${config.keyProviderURL}/acsChallenge`,
          pareq: `$${body.amount / 100}`,
          md: 'dummySessionID+dummyThreeDSRequestId',
        };
      }
    } else if (body.AcsCode && body.AcsCode !== Mock.AcsCode) {
      result.status = 'KO';
      timeout = 100;
    }

    setTimeout(() => res.json(result), timeout);
  }

  acsChallenge(req, res) {
    res.render('acsChallenge', {
      acsCode: Mock.AcsCode,
      termUrl: req.body.TermUrl,
      amount: req.body.PaReq,
    });
  }

  getPendingPayments() {
    return {};
  }

  clearPendingPayments() {
  }
}
