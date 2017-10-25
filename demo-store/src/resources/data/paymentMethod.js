import config from '../../../config';

export default {
  supportedMethods: 'encrypted-card',
  data: {
    supportedNetworks: [
      'amex',
      'diners',
      'discover',
      'jcb',
      'mastercard',
      'visa',
    ],
    supportedTypes: [
      'debit',
      'credit',
      'prepaid',
    ],
    keyProviderURL: config.keyProviderURL,
  },
};
