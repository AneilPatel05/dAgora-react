import React from 'react';
import ProductList from './store/ProductList';
import Dashboard from './admin/Dashboard';

const Home = (props) => {
  return (
    <div id="content">
      <h1>dAgora <span className="subheading">Decentralized Marketplace</span></h1>
      <ProductList productList={props.productList} dAgora={props.dAgora} />
      <Dashboard dAgora={props.dAgora} />
    </div>
  );
}

export default Home;
