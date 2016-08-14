import React, { Component } from 'react';
import Product from './Product';

const ProductList = (props) => {
  //console.log(props.productList);
  if(props.productList.length < 1) {
    return <div><h2>No Products</h2></div>
  }

  const ProductItems = props.productList.map((product) => {
    return (
      <Product key={product[0]} product={product} dAgoraShop={props.dAgoraShop} />
    );
  });

  return (
    <div id="products" className="col-md-12">
      {ProductItems}
    </div>
  );
}

export default ProductList;
