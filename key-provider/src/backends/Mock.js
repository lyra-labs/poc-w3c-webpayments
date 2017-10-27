export default class Mock {
  constructor() {
    this.pendingPayments = {};
  }

  // eslint-disable-next-line class-methods-use-this
  payment(res) {
    setTimeout(() => {
      res.json({ status: 'OK' });
    }, 2000);
  }

  getPendingPayments() {
    return this.pendingPayments;
  }
}
