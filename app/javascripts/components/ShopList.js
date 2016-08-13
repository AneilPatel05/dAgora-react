import React, { Component } from 'react';
import ShopItem from './ShopItem';

const ShopList = (props) => {
  //console.log(props.productList);
  if(props.shopList.length < 1) {
    return <div><h2>No Shops</h2></div>
  }

  const ShopItems = props.shopList.map((shop) => {
    console.log(shop);
    return (
      <ShopItem key={shop} shop={shop} dAgoraShop={props.dAgoraShop.at(shop)} setShop={props.setShop} />
    );
  });

  return (
    <div id="shops" className="col-md-12">
      {ShopItems}
    </div>
  );
}

export default ShopList;
