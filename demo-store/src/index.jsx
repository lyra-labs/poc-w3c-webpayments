import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import * as colors from 'material-ui/styles/colors';
// eslint-disable-next-line
import PaymentRequestPolyfill from 'payment-request-polyfill'; // must be yarn linked manually
import reducer from './redux/reducer';
import App from './components/App';
import './resources/sass/main.scss';

injectTapEventPlugin();

// Overriding native Payment Request API with Lyra's implementation.
// This implementation is a POC to demonstrate a working "Encrypted Card Payment Handler".
// https://github.com/w3c/webpayments-methods-tokenization/wiki/encrypted_card
window.PaymentRequest = PaymentRequestPolyfill;

const store = createStore(reducer);

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: colors.redA200,
  },
});

render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <Provider store={store}>
      <App />
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root'),
);
