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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dAgora: dAgora.deployed(),
      currentShop: null,
      currentShopAddress: null,
      currentShopCategories: null,
      statusMessage: null,
      statusType: null,
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
    //this.getInitialProducts();
  }

  render() {
    return (
      <div id="site-content">
        <Navigation accountBalance={this.state.accountBalance} gpcList={this.state.gpcList} />
        <div className="container site-content">
          <Status />
          <div id="content">
            <h1>dAgora <span className="subheading">Decentralized Marketplace</span></h1>
          </div>
        </div>
        <Footer contractAddress={this.state.contractAddress} contractBalance={this.state.contractBalance} />
      </div>
    );
  }
}

// This component's generated HTML and put it on the page (in the DOM)
ReactDOM.render(<App />, document.querySelector('.site'));

window.onload = function() {

  if($("#gpcSegment").length > 0) {
    $.each( gpcCodes.segment, function( key, val ) {
      $("#gpcSegment").append( "<option value='" + key + "'>" + val.description + "</li>" );
    });
  }
}
