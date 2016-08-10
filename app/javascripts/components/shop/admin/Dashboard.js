import React, { Component } from 'react';
import AddProduct from './AddProduct';
import UpdateProduct from './UpdateProduct';
import RemoveProduct from './RemoveProduct';
import WithdrawFunds from './WithdrawFunds';

const Dashboard = (props) => {

  return (
    <div>
      <ul className="nav nav-tabs">
        <li className="active"><a data-toggle="tab" href="#add-products">Add Product</a></li>
        <li><a data-toggle="tab" href="#update-product">Update Product</a></li>
        <li><a data-toggle="tab" href="#remove-product">Remove Product</a></li>
        <li><a data-toggle="tab" href="#withdraw">Withdraw Funds</a></li>
      </ul>

      <div className="tab-content">
        <div id="add-products" className="tab-pane fade in active">
          <AddProduct dAgoraShop={props.dAgoraShop} />
        </div>
        <div id="update-product" className="tab-pane fade">
          <UpdateProduct dAgoraShop={props.dAgoraShop} />
        </div>
        <div id="remove-product" className="tab-pane fade">
          <RemoveProduct dAgoraShop={props.dAgoraShop} />
        </div>
        <div id="withdraw" className="tab-pane fade">
          <WithdrawFunds dAgoraShop={props.dAgoraShop} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
