import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';
import { Paper, Popover, RaisedButton } from 'material-ui';
import IconSuccess from 'material-ui/svg-icons/navigation/check';
import IconError from 'material-ui/svg-icons/navigation/close';
import IconShoppingCart from 'material-ui/svg-icons/action/shopping-cart';
import * as colors from 'material-ui/styles/colors';
import MuiNotification from 'react-materialui-notifications';
import { clearCart } from '../redux/actions';
import * as keyProvider from '../rest/keyProvider';
import paymentMethod from '../resources/config/paymentMethod.json';

class Cart extends React.Component {
  static propTypes = {
    cart: PropTypes.shape({
      total: PropTypes.number.isRequired,
      items: PropTypes.array.isRequired,
    }).isRequired,
    onClearCart: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  @autobind
  onCheckout() {
    this.setState({ open: false });
    this.handlePayment();
  }

  @autobind
  onClearCart() {
    this.setState({ open: false }, this.props.onClearCart);
  }

  @autobind
  onCartOpen(e) {
    this.setState({
      open: true,
      anchorEl: e.currentTarget,
    });
  }

  @autobind
  onCartClose() {
    this.setState({ open: false });
  }

  getLabel() {
    const { total, items } = this.props.cart;

    if (items.length === 0) {
      return '$0.00';
    }

    return `$${total}, ${items.length} item${items.length > 1 ? 's' : ''}`;
  }

  displayNotification(notifConfig) {
    MuiNotification.showNotification(Object.assign({}, notifConfig, {
      autoHide: 4000,
      zDepth: 2,
    }));

    this.forceUpdate();
  }

  displayNotificationSuccess() {
    this.displayNotification({
      title: 'Thank you for your order',
      additionalText: 'Your payment has been approved',
      icon: <IconSuccess />,
      iconBadgeColor: colors.green500,
    });
  }

  displayNotificationError(reason) {
    this.displayNotification({
      title: 'Something went wrong',
      additionalText: `Your payment has been ${reason}`,
      icon: <IconError />,
      iconBadgeColor: colors.red500,
    });
  }

  handlePayment() {
    const details = {
      total: {
        label: 'Total',
        amount: { currency: 'USD', value: this.props.cart.total },
      },
      displayItems: this.props.cart.items.map(item => ({
        label: `${item.artist} - ${item.title}`,
        amount: { currency: 'USD', value: item.price },
      })),
    };

    const paymentRequest = new window.PaymentRequest([paymentMethod], details);
    let paymentResponse;

    paymentRequest
      .show()
      .then((payRes) => {
        paymentResponse = payRes;

        const body = {
          amount: this.props.cart.total * 100,
          currency: 840, // ISO 4217 code for USD
          encryptedCardData: paymentResponse.details.encryptedCardData,
        };

        return keyProvider.payment(paymentResponse.requestId, body);
      })
      .then((res) => {
        if (res.status === 'KO') {
          throw new Error(res.error);
        }

        paymentResponse.complete('success');
        this.displayNotificationSuccess();
        this.onClearCart();
      })
      .catch((err) => {
        if (paymentResponse) {
          paymentResponse.complete('error');
          this.displayNotificationError('refused');
        } else {
          this.displayNotificationError('cancelled');
        }

        if (err && err.message) {
          throw new Error(err.message);
        }
      });
  }

  render() {
    const { cart } = this.props;

    const cartStyle = {
      boxShadow: 'none',
      borderRadius: '10px',
    };

    const labelStyle = {
      fontSize: '0.9em',
    };

    const paperStyle = {
      width: '330px',
      padding: '14px',
      textAlign: 'right',
    };

    const buttonStyle = {
      flexGrow: 1,
      margin: '10px 8px',
    };

    return (
      <div id="cart">
        <RaisedButton
          onClick={this.onCartOpen}
          label={this.getLabel()}
          icon={<IconShoppingCart />}
          style={cartStyle}
          labelStyle={labelStyle}
          backgroundColor={colors.grey200}
          labelColor={colors.grey600}
          disabled={cart.items.length === 0}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.onCartClose}
        >
          <Paper style={paperStyle} zDepth={2}>
            <div id="summary">
              {cart.items.map(item => (
                <div key={item.id}>
                  {item.artist} - {item.title} &nbsp;&nbsp;${item.price}
                </div>
              ))}
              <div>
                <b>Total &nbsp;&nbsp;${cart.total}</b>
              </div>
            </div>
            <div id="actions">
              <RaisedButton
                primary
                label="Checkout"
                style={buttonStyle}
                onClick={this.onCheckout}
              />
              <RaisedButton
                label="Clear Cart"
                style={buttonStyle}
                onClick={this.onClearCart}
              />
            </div>
          </Paper>
        </Popover>
        <MuiNotification />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  cart: state,
});

const mapDispatchToProps = dispatch => ({
  onClearCart: () => dispatch(clearCart()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
