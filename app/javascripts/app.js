import {} from "../stylesheets/app.scss";

import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';

import web3 from './helpers/web3Helper';
//import dAgora from '../../build/contracts/dAgora.sol.js';
import dAgoraShop from '../../build/contracts/dAgoraShop.sol.js';
dAgoraShop.setProvider(web3.currentProvider);

import gpcCodes from './json/gpcCodes.json';
import Navigation from './components/template/Navigation';
import Status from './components/status';
import Home from './components/home';
import Footer from './components/template/Footer';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dAgora: dAgoraShop.deployed(),
      defaultAccount: web3.eth.defaultAccount,
      accountBalance: web3.fromWei(web3.eth.getBalance(web3.eth.defaultAccount), "ether").toFixed(5)+ " ETH",
      contractAddress: dAgoraShop.deployed().address,
      contractBalance: web3.fromWei(web3.eth.getBalance(dAgoraShop.deployed().address), "ether").toFixed(5),
      gpcList: [],
      productList: [],
      isAdmin: false
    };
    var _this = this;
    this.state.dAgora.owner.call().then(function(result) {
      //console.log(result);
      if(result == web3.eth.defaultAccount) _this.setState({isAdmin: true});
      return result;
    }).catch(function(e) {
      console.error(e);
    });;
    this.getInitialProducts();
  }

  getInitialProducts = () => {
    var _gpcList = [];
    var _this = this;

    this.state.dAgora.getGpcLength.call().then(function (result) {
      for(var i = 0; i < parseInt(result); i++) {
        _gpcList.push(_this.state.dAgora.gpcList.call(i));
      }
      return Promise.all(_gpcList).then(function(gpcArray) {
        //console.log(gpcArray);
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
    _this.state.dAgora.getProductCount.call(gpcSegment).then(function(result) {
      //console.log("Segment #" + gpcArray[0] + " Count:" + parseInt(result));
      var _dphList = [];
      for(var i = 0; i < parseInt(result); i++) {
        _dphList.push(_this.state.dAgora.productCategoryMap.call(gpcSegment, i));
      }
      return Promise.all(_dphList).then(function(dphArray) {
        //console.log(dphArray);
        var _products = [];
        for(var i = 0; i < dphArray.length; i++) {
          _products.push(_this.state.dAgora.productMap.call(dphArray[i]));
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

  render() {
    return (
      <div id="site-content">
        <Navigation accountBalance={this.state.accountBalance} gpcList={this.state.gpcList} />
        <div className="container site-content">
          <Status />
          <Home dAgora={this.state.dAgora} productList={this.state.productList} isAdmin={this.state.isAdmin} />
        </div>
        <Footer contractAddress={this.state.contractAddress} contractBalance={this.state.contractBalance} />
      </div>
    );
  }
}

// This component's generated HTML and put it on the page (in the DOM)
ReactDOM.render(<App />, document.querySelector('.site'));

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

  if($("#gpcSegment").length > 0) {
    $.each( gpcCodes.segment, function( key, val ) {
      $("#gpcSegment").append( "<option value='" + key + "'>" + val.description + "</li>" );
    });
  }
}
