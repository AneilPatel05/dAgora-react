import React, { Component } from 'react';
import web3 from '../../helpers/web3Helper';
import ProductList from './ProductList';
import Dashboard from './admin/Dashboard';

class Shop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dAgora: props.dAgora,
      dAgoraShop: props.dAgoraShop,
      shopName: null;
      contractAddress: dAgoraShop.address,
      contractBalance: web3.fromWei(web3.eth.getBalance(props.dAgoraShop.address), "ether").toFixed(5),
      gpcList: [],
      productList: [],
      isAdmin: false
    };
    var _this = this;
    this.state.dAgoraShop.name.call().then(function(result)) {
      this.setState({shopName: result});
    }
    this.state.dAgoraShop.owner.call().then(function(result) {
      //console.log(result);
      if(result == web3.eth.defaultAccount) _this.setState({isAdmin: true});
      return result;
    }).catch(function(e) {
      console.error(e);
    });
    this.getInitialProducts();

    this.state.dAgoraShop.getProductCount.call(68000000).then(function(result) {
      console.log(parseInt(result));
    });

    this.state.dAgoraShop.productMap.call("0x280b147ae80eadd71726576d706d558c9632ef1f5896d90b301d56286919a183").then(function(result) {
      console.log(result);
    })
  }

  render = () => {
    return (
      <div id="content">
          <h1>{this.state.shopName} <span className="subheading">dAgora Marketplace</span></h1>
          <ProductList productList={this.state.productList} dAgoraShop={this.dAgoraShop} />
          { props.isAdmin ? (<Dashboard dAgoraShop={this.state.dAgoraShop} /> ) : null }
      </div>
    );
  }

  getInitialProducts = () => {
    var _gpcList = [];
    var _this = this;

    this.state.dAgoraShop.getGpcLength.call().then(function (result) {
      for(var i = 0; i < parseInt(result); i++) {
        _gpcList.push(_this.state.dAgoraShop.gpcList.call(i));
      }
      return Promise.all(_gpcList).then(function(gpcArray) {
        console.log(parseInt(gpcArray));
        _this.setState({gpcList: gpcArray});
        for(var i = 0; i < gpcArray.length; i++) {
          _this.getProductsByGpc(gpcArray[i], true);
        }
        return null;
      });
    }).catch(function(e) {
      console.error(e);
    });
  }

  getProductsByGpc = (gpcSegment, concat=false) => {
    var _this = this;
    _this.state.dAgoraShop.getProductCount.call(gpcSegment).then(function(result) {
      //console.log("Segment #" + gpcArray[0] + " Count:" + parseInt(result));
      var _dphList = [];
      for(var i = 0; i < parseInt(result); i++) {
        _dphList.push(_this.state.dAgoraShop.productCategoryMap.call(gpcSegment, i));
      }
      return Promise.all(_dphList).then(function(dphArray) {
        console.log(dphArray);
        var _products = [];
        for(var i = 0; i < dphArray.length; i++) {
          _products.push(_this.state.dAgoraShop.productMap.call(dphArray[i]));
        }
        return Promise.all(_products).then(function(productArray) {
          //console.log(productArray);
          if(concat) {
            var currentProductList = _this.state.productList;
            productArray = currentProductList.concat(productArray);
          }
          _this.setState({productList: productArray});
        }).catch(function(e) {
          console.error(e);
        });
      }).catch(function(e) {
        console.error(e);
      });
    }).catch(function(e) {
      console.error(e);
    });
  }
}

export default Shop;
