import {} from "../stylesheets/app.scss";

import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';

import web3 from './helpers/web3Helper';
import dAgora from '../../build/contracts/dAgora.sol.js';
dAgora.setProvider(web3.currentProvider);

import Navigation from './components/template/Navigation';
import Status from './components/status';
import Home from './components/home';
import Footer from './components/template/Footer';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dAgora: dAgora.deployed(),
      defaultAccount: web3.eth.defaultAccount,
      accountBalance: web3.fromWei(web3.eth.getBalance(web3.eth.defaultAccount), "ether").toFixed(5)+ " ETH",
      contractAddress: dAgora.deployed().address,
      contractBalance: web3.fromWei(web3.eth.getBalance(dAgora.deployed().address), "ether").toFixed(5),
      productList: [],
    };
    this.getProductList();
    console.log(this.state.dAgora);
  }

  getProductList = () => {
    var _dphList = [];
    var _products =[];
    var _this = this;
    this.state.dAgora.productCount.call().then(function (result) {
      console.log(parseInt(result));
      for(var i = 1; i <= parseInt(result); i++) {
        _dphList.push(_this.state.dAgora.productMap.call(i));
      }
      return Promise.all(_dphList).then(function(dphArray) {
        console.log(dphArray);
        dphArray.forEach(function(dphCode) {
          _products.push(_this.state.dAgora.productList.call(dphCode));
        });
        return Promise.all(_products).then(function(productArray) {
          console.log(productArray);
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

  render() {
    return (
      <div>
        <Navigation accountBalance={this.state.accountBalance} />
        <div className="container site-content">
          <Status />
          <Home dAgora={this.state.dAgora} productList={this.state.productList} />
        </div>
        <Footer contractAddress={this.state.contractAddress} contractBalance={this.state.contractBalance} />
      </div>
    );
  }
}

// This component's generated HTML and put it on the page (in the DOM)
ReactDOM.render(<App />, document.querySelector('#site-content'));

/**
 * Set a message in the status bar
 * @param message The Message to place in the status bar
 * @param type The kind of message to place, based on bootstrap alerts (http://getbootstrap.com/components/#alerts)
 */
function setStatus(message, type="info") {
  var status = document.getElementById("status");
  $("#status").removeClass (function (index, css) {
    return (css.match (/(^|\s)alert-\S+/g) || []).join(' ');
  }).addClass("alert-" + type);
  status.innerHTML = message;
};

window.onload = function() {

  var gpc = $.getJSON("/json/gpcCodes.json", function( data ) {
    var gpcJSON = data;
    var items = [];
    if($("#gpcSegment").length > 0) {
      $.each( data.segment, function( key, val ) {
        $("#gpcSegment").append( "<option value='" + key + "'>" + val.description + "</li>" );
      });
    }
  });
}
