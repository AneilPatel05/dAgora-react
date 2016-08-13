import React, { Component } from 'react';
import web3 from '../../../helpers/web3Helper';
import gpcCodes from '../../../json/gpcCodes.json';
import GpcOption from './GpcOption';

class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgoraShop: props.dAgoraShop, GpcOptions: null};
    //this.loadGpc();
  }

  render = () => {
    const gpcItems = gpcCodes.segment.map((gpcItem) => {
      return (
        <GpcOption key={gpcItem.gpc} index={gpcItem.gpc} description={gpcItem.description} />
      );
    });
    return (
    <div>
      <h1 className="text-center">Add New Product</h1>
      <form className="col-md-6 col-md-offset-3">
        <div className="form-group col-md-12">
          <input type="text" className="form-control" name="title" id="title" placeholder="Product Title" onChange={this.bindState('title')} />
        </div>
        <div className="form-group col-md-12">
          <select id="gpcSegment" name="gpcSegment" className="form-control" onChange={this.bindState('gpcSegment')}>
            <option>-- Select Category --</option>
            {gpcItems}
          </select>
        </div>
        <div className="form-group col-md-6">
          <label className="sr-only" htmlFor="price">Price (in Ether)</label>
          <div className="input-group">
            <div className="input-group-addon">&Xi;</div>
            <input type="text" className="form-control" name="price" id="price" placeholder="Price (Ether)" onChange={this.bindState('price')} />
          </div>
        </div>
        <div className="form-group col-md-6">
          <input type="text" className="form-control" name="stock" id="stock" placeholder="Stock" onChange={this.bindState('stock')} />
        </div>
        <div className="form-group col-md-12">
          <textarea className="form-control" id="description" name="description" rows="4" placeholder="Description" onChange={this.bindState('description')}></textarea>
        </div>
        <div className="col-md-12">
          <button type="button" id="addProductFormButton" className="btn btn-primary" onClick={event => this.handleSubmit(event)}>Add Product</button>
        </div>
      </form>
    </div>
    );
  }

  bindState = (property) => {
  	return (event) => { this.setState({ [property]: event.target.value }); };
  }

  loadGpc = () => {
    console.log(gpcCodes);
    var _gpcList = [];
    var _this = this;
    for (var i=0; i < gpcCodes.segment.length; i++) {
      _gpcList.push(<GpcOption key={gpcCodes.segment[i].gpc} index={gpcCodes.segment[i].gpc} description={gpcCodes.segment[i].description} />);
    }
    return Promise.all(_gpcList).then(function(gpcArray) {
      console.log(gpcArray);
      _this.setState({GpcOptions: gpcArray.join("")}, function() {
        _this.forceUpdate();
      });
    }).catch(function(e) {
      console.error(e);
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var da = this.state.dAgoraShop;
    console.log(da);
    console.log(this.state.title); console.log(this.state.description); console.log(this.state.gpcSegment); console.log(this.state.price); console.log(this.state.stock);
    //setStatus("Initiating transaction... (please wait)");
    da.addProduct(this.state.title, this.state.description, this.state.gpcSegment, web3.toWei(parseFloat(this.state.price), "ether"), parseInt(this.state.stock), {from: web3.eth.defaultAccount, gas: 3000000}).then(function (tx_id) {
      console.log(tx_id);
      //setStatus("Product added successfully", "success");
    }).catch(function (e) {
      console.log(e);
      //setStatus("Error adding product: " + e.message, "danger");
    });
  }
}

export default AddProduct;
