import {} from "../stylesheets/app.scss";

import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';

import web3 from './helpers/web3Helper';
import dAgora from '../../build/contracts/dAgora.sol.js';
import dAgoraShop from '../../build/contracts/dAgoraShop.sol.js';
dAgora.setProvider(web3.currentProvider);
dAgoraShop.setProvider(web3.currentProvider);

import gpcCodes from './json/gpcCodes.json';
import Navigation from './components/template/Navigation';
import Status from './components/template/status';
import Footer from './components/template/Footer';
import RegisterShop from './components/RegisterShop';
import ShopList from './components/ShopList';
import Shop from './components/shop/index';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dAgora: dAgora.deployed(),
      currentShop: null,
      currentShopAddress: null,
      currentShopCategories: null,
      shopList: [],
      statusMessage: "",
      statusType: "",
      defaultAccount: web3.eth.defaultAccount,
      accountBalance: web3.fromWei(web3.eth.getBalance(web3.eth.defaultAccount), "ether").toFixed(5)+ " ETH",
      contractAddress: dAgora.deployed().address,
      contractBalance: web3.fromWei(web3.eth.getBalance(dAgora.deployed().address), "ether").toFixed(5),
      gpcList: [],
      productList: [],
      isAdmin: false
    };
    var _this = this;
    this.state.dAgora.admin.call().then(function(result) {
      //console.log(result);
      if(result == web3.eth.defaultAccount) _this.setState({isAdmin: true});
      return result;
    }).catch(function(e) {
      console.error(e);
    });
    this.getShopList();

    this.state.dAgora.isNameAvailable.call('test').then(function(result) {
      console.log(result);
    });
    this.state.dAgora.getShopAddress.call('test').then(function(result) {
      console.log(result);
    });
  }

  render = () => {
    var mainContent;
    var _this = this;
    if (this.state.currentShopAddress == null) {
      mainContent = (
        <div id="content">
          <h1>dAgora <span className="subheading">Decentralized Marketplace</span></h1>
          <ShopList shopList={this.state.shopList} dAgoraShop={dAgoraShop} setShop={this.setShop} />
          <RegisterShop dAgora={this.state.dAgora} setStatus={this.setStatus} />
        </div>);
    } else {
      mainContent = <Shop dAgora={this.state.dAgora} dAgoraShop={dAgoraShop.at(this.state.currentShopAddress)} setGpcList={this.setGpcList} />;
    }

    return (
      <div id="site-content">
        <Navigation accountBalance={this.state.accountBalance} gpcList={this.state.gpcList} />
        <div className="container site-content">
          <Status statusMessage={this.state.statusMessage} statusType={this.state.statusType}/>
          {mainContent}
        </div>
        <Footer contractAddress={this.state.contractAddress} contractBalance={this.state.contractBalance} />
      </div>
    );
  }

  setStatus = (message, type) => {
    this.setState({statusMessage: message, statusType: type});
  }

  setShop = (address) => {
    this.setState({currentShopAddress: address});
    console.log("State: " + this.state.currentShopAddress);
  }

  setGpcList = (gpcItems) => {
    this.setState({gpcList: gpcItems});
  }

  getShopList = () => {
    var _this = this;
    this.state.dAgora.getShopListSize.call().then(function(result) {
      var _shopList = [];
      for(var i = 0; i < parseInt(result); i++) {
        _shopList.push(_this.state.dAgora.getShopAddressByIndex.call(i));
      }
      return Promise.all(_shopList).then(function(shopArray) {
        console.log(shopArray);
        _this.setState({shopList: shopArray});
      }).catch(function(e) {
        console.error(e);
      });
    });
  }
}

// This component's generated HTML and put it on the page (in the DOM)
ReactDOM.render(<App />, document.querySelector('.site'));
