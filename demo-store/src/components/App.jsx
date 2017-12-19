import React, { Fragment } from 'react';
import autobind from 'autobind-decorator';
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
          <h4>Please fill the captcha to access the demo</h4>
          {/* eslint-disable react/no-string-refs */}
          <ReCAPTCHA
            ref="recaptcha"
            sitekey="6LdO2zwUAAAAAOjGA91nOJsYoiWAwNuCPUn0hSPE"
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
