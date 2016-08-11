import React, { Component } from 'react';
import web3 from '../helpers/web3Helper';
import Status from './template/status';

class RegisterShop extends Component {
  constructor(props) {
    super(props);
    this.state = {dAgora: props.dAgora, setStatus: props.setStatus};
    var _this = this;
    this.state.dAgora.registrationFee.call().then(function(result) {
      _this.setState({registrationFee: web3.fromWei(parseInt(result), "ether")});
    });
  }

  render = () => (
    <div>
      <h2 className="text-center">Register Shop</h2>
      <form className="col-md-6 col-md-offset-3">
        <Status statusMessage={this.state.statusMessage} statusType={this.state.statusType} />
        <p>Registration Fee: <b>{this.state.registrationFee}</b> ETH</p>
        <div className="form-group col-md-8">
          <input type="text" className="form-control" name="name" id="name" placeholder="Stop Name" onChange={this.bindState('name')} />
        </div>
        <div className="form-group col-md-4"><button id="checkNameButton" className="btn btn-secondary" onClick={event => this.checkAvailability(event)}>Check Availability</button></div>
        <div className="col-md-12">
          <button type="button" id="RegisterStoreFormButton" className="btn btn-primary" onClick={event => this.handleSubmit(event)}>Create Shop</button>
        </div>
      </form>
    </div>
  )

  bindState = (property) => {
  	return (event) => { this.setState({ [property]: event.target.value }); };
  }

  checkAvailability = (event) => {
    event.preventDefault();
    var da = this.state.dAgora;
    var _this = this;
    //setStatus("Initiating transaction... (please wait)");
    da.isNameAvailable.call(this.state.name.toLowerCase()).then(function (result) {
      console.log(result);
      if(result === true) _this.setState({statusMessage: "Name Available", statusType: "success"});
      else _this.setState({statusMessage: "Name Taken", statusType: "danger"});
      //setStatus("Product added successfully", "success");
    }).catch(function (e) {
      console.log(e);
      //setStatus("Error adding product: " + e.message, "danger");
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    var da = this.state.dAgora;
    //setStatus("Initiating transaction... (please wait)");
    da.createShop(this.state.name.toLowerCase(), {from: web3.eth.defaultAccount, value: web3.toWei(1, "ether"), gas: 3000000}).then(function (tx_id) {
      console.log(tx_id);
      //setStatus("Product added successfully", "success");
    }).catch(function (e) {
      console.log(e);
      //setStatus("Error adding product: " + e.message, "danger");
    });
  }
}

export default RegisterShop;
