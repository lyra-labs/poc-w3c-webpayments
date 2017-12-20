import React, { Fragment } from 'react';
import autobind from 'autobind-decorator';
import CircularProgress from 'material-ui/CircularProgress';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from './Header';
import Products from './Products';
import Footer from './Footer';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isCaptchaOK: false,
    };

    this.captcha = null;
  }

  componentDidMount() {
    window.addEventListener('load', () => {
      this.captcha.execute();
    });
  }

  @autobind
  grecaptchaCallback() {
    this.setState({
      isCaptchaOK: true,
    });
  }

  render() {
    if (!this.state.isCaptchaOK) {
      return (
        <div id="recaptcha-container">
          <CircularProgress size={70} />
          {/* eslint-disable react/no-string-refs */}
          <ReCAPTCHA
            ref={(el) => { this.captcha = el; }}
            size="invisible"
            sitekey="6LfcxD0UAAAAAD9NNF3-BINpcdD_2PXEhUzULLCS"
            onChange={this.grecaptchaCallback}
          />
          {/* eslint-enable react/no-string-refs */}
        </div>
      );
    }

    return (
      <Fragment>
        <Header />
        <Products />
        <Footer />
      </Fragment>
    );
  }
}
