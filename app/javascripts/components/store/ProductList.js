import React, { Component } from 'react';
import Product from './Product';

const ProductList = (props) => {
  //console.log(props.productList);
  if(props.productList.length < 1) {
    return <div><h2>No Products</h2></div>
  }

  const ProductItems = props.productList.map((product) => {
    //console.log(product[0]);
    return (
      <Product key={product[0]} product={product} dAgora={props.dAgora} />
    );
  });

  return (
    <div id="products" className="col-md-12">
      {ProductItems}
    </div>
  );
}

export default ProductList;
