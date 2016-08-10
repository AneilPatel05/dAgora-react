import React, { Component } from 'react';
import web3 from '../../helpers/web3Helper';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgoraShop: props.dAgoraShop, product: props.product};
  }

  render = () => (
    <div className="col-md-4 text-center">
      <div className="well product product-home">
        <div className="ribbon">
          <span>&Xi; {web3.fromWei(parseFloat(this.state.product[5]), "ether")}</span>
        </div>
        <img src="https://placeimg.com/150/150/any" className="img-rounded hvr-grow" />
        <h3>{this.state.product[2]}</h3>
        <h4>{this.state.product[3]}</h4>
        <h6><b>Stock</b>: {parseFloat(this.state.product[6])}</h6>
        <p><button type="button" className="btn btn-primary" onClick={event => this.handlePurchase(event)}>Buy Now</button></p>
      </div>
    </div>
  )

  handlePurchase = (event) => {
    event.preventDefault();
    var da = this.state.dAgoraShop;
    var _product = this.state.product;
    da.productMap.call(_product[0]).then(function(product) {
      //console.log(product);
      return da.buy( _product[0], {from: web3.eth.defaultAccount, gas: 3000000, value: parseFloat(product[5])} );
    }).then(function(tx_id) {
      console.log(tx_id);
      return web3.eth.getTransactionReceiptMined(tx_id);
    }).then(function(receipt) {
      console.log(receipt);
      // TODO Refresh Balance
    }).catch(function (e) {
      console.log(e);
    });

  }
}

export default Product;
