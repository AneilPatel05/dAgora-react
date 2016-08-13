import React, { Component } from 'react';
import web3 from '../helpers/web3Helper';

class ShopItem extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgoraShop: props.dAgoraShop, shop: props.shop, shopName: "", setShop: props.setShop};
    var _this = this;
    this.state.dAgoraShop.name.call().then(function(result) {
      _this.setState({shopName: result});
    }).catch(function(e) {
      console.error(e);
    });
  }

  render = () => (
    <div className="col-md-4 text-center">
      <div className="well shop shop-list">
        <h3>{this.state.shopName}</h3>
        <img src="https://placeimg.com/150/150/any" className="img-rounded hvr-grow" />
        <p><button type="button" className="btn btn-primary" onClick={event => this.handleClick(event)}>Shop Now</button></p>
      </div>
    </div>
  )

  handleClick = (event) => {
    event.preventDefault();
    var da = this.state.dAgoraShop;
    console.log(this.state.shop);
    this.state.setShop(this.state.shop);
  }
}

export default ShopItem;
