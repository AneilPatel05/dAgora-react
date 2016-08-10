import React, { Component } from 'react';
import web3 from '../../../helpers/web3Helper';

class WithdrawFunds extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgoraShop: props.dAgoraShop};
  }

  render = () => (
    <div>
      <h1 className="text-center">Withdraw Funds</h1>
      <form className="col-md-6 col-md-offset-3">
        <div className="form-group">
          <input type="text" className="form-control" id="recipient" name="recipient" placeholder="Recipient (0x....)" onChange={this.bindState('recipient')} />
        </div>
        <div className="form-group">
          <label className="sr-only" htmlFor="price">Amount (in Ether)</label>
          <div className="input-group">
            <div className="input-group-addon">&Xi;</div>
            <input type="text" className="form-control" id="amount" name="amount" placeholder="Amount (Ether)" onChange={this.bindState('amount')} />
          </div>
        </div>
        <button type="button" id="withdrawFormButton" className="btn btn-primary" onClick={event => this.handleSubmit(event)}>Withdraw</button>
      </form>
    </div>
  )

  bindState = (property) => {
  	return (event) => { this.setState({ [property]: event.target.value }); };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var da = this.state.dAgoraShop;
    da.withdraw(this.state.recipient, web3.toWei(parseFloat(this.state.amount), "ether"), {from: web3.eth.defaultAccount}).then(function(tx_id) {
      console.log(tx_id);
      return web3.eth.getTransactionReceiptMined(tx_id);
    }).then(function(receipt) {
      console.log(receipt);
      // TODO Refresh Balance
      return true;
    }).catch(function(e) {
      console.error(e);
      return false;
    });
  }
}

export default WithdrawFunds;
