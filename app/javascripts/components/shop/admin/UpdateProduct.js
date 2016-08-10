import React, { Component } from 'react';
import web3 from '../../../helpers/web3Helper';

class UpdateProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgoraShop: props.dAgoraShop};
  }

  render = () => (
    <div>
      <h1 className="text-center">Update Product</h1>
      <form className="col-md-6 col-md-offset-3">
        <div className="form-group col-md-9">
          <input type="text" className="form-control" name="dphCode" value={this.state.dphCode} id="dphCode" placeholder="DPH Code (0x....)" onChange={this.bindState('dphCode')} />
        </div>
        <div className="col-md-3">
          <button type="button" className="btn btn-success" onClick={event => this.loadProduct(event)}>Load...</button>
        </div>
        <div className="form-group col-md-6">
          <label className="sr-only" htmlFor="price">Price (in Ether)</label>
          <div className="input-group">
            <div className="input-group-addon">&Xi;</div>
            <input type="text" className="form-control" name="price" value={this.state.price} id="price" placeholder="Price (Ether)" onChange={this.bindState('price')} />
          </div>
        </div>
        <div className="form-group col-md-6">
          <input type="text" className="form-control" value={this.state.stock} id="stock" name="stock" placeholder="New Stock Amount" onChange={this.bindState('stock')} />
        </div>
        <div className="form-group col-md-12">
          <textarea className="form-control" id="description" name="description" rows="4" placeholder="Description" value={this.state.description} onChange={this.bindState('description')}>{this.state.description}</textarea>
        </div>
        <div className="col-md-12">
          <button type="button" id="updateStockButton" className="btn btn-primary" onClick={event => this.handleSubmit(event)}>Update</button>
        </div>
      </form>
    </div>
  )

  bindState = (property) => {
  	return (event) => { this.setState({ [property]: event.target.value }); };
  }

  loadProduct = (event) => {
    event.preventDefault();
    var _this = this;
    this.state.dAgoraShop.productMap.call(this.state.dphCode).then(function(result) {
      console.log(result);
      _this.setState({price: web3.fromWei(result[5], "ether"), stock: result[6], description: result[3]});
    }).catch(function(e) {
      console.error(e);
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var da = this.state.dAgoraShop;
    da.updateProduct(this.state.dphCode, this.state.description, web3.toWei(parseFloat(this.state.price), "ether"), parseInt(this.state.stock), {from: web3.eth.defaultAccount, gas: 3000000}).then(function (tx_id) {
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
