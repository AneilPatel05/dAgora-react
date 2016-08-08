import React, { Component } from 'react';
import web3 from '../../helpers/web3Helper';

class UpdateProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgora: props.dAgora};
  }

  render = () => (
    <div>
      <h1 className="text-center">Remove Product</h1>
      <form className="col-md-6 col-md-offset-3">
        <div className="form-group col-md-9">
          <input type="text" className="form-control" name="dphCode" id="dphCode" placeholder="DPH Code (0x....)" onChange={this.bindState('dphCode')} />
        </div>
        <div className="col-md-3">
          <button type="button" id="removeProductButton" className="btn btn-danger" onClick={event => this.handleSubmit(event)}>Remove</button>
        </div>
      </form>
    </div>
  )

  bindState = (property) => {
  	return (event) => { this.setState({ [property]: event.target.value }); };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var da = this.state.dAgora;
    da.removeProduct(this.state.dphCode, {from: web3.eth.defaultAccount, gas: 3000000}).then(function (tx_id) {
      console.log(tx_id);
      return web3.eth.getTransactionReceiptMined(tx_id);
    }).then(function(receipt) {
      console.log(receipt);
    }).catch(function (e) {
      console.log(e);
    });
  }
}

export default UpdateProduct;
