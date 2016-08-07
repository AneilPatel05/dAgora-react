import React from 'react';
import ProductList from './store/ProductList';
import Dashboard from './admin/Dashboard';
import web3 from '../helpers/web3Helper';

const Home = (props) => {
  return (
    <div id="content">
      <h1>dAgora <span className="subheading">Decentralized Marketplace</span></h1>
      <ProductList productList={props.productList} dAgora={props.dAgora} />
      { props.isAdmin ? (<Dashboard dAgora={props.dAgora} /> ) : null }
    </div>
  );
}

export default Home;
