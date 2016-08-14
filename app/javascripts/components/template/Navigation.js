import React from 'react';
import CategoryItem from './CategoryItem';

const Navigation = ({accountBalance, gpcList, setCurrentGpc, getProductsByGpc}) => {

  const CategoryItems = gpcList.map((gpcSegment) => {
    //console.log(gpcSegment);
    return (
      <CategoryItem key={parseInt(gpcSegment)} item={parseInt(gpcSegment)} setCurrentGpc={setCurrentGpc} getProductsByGpc={getProductsByGpc} />
    );
  });

  return (
    <nav className="navbar navbar-inverse navbar-static-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1" aria-expanded="false">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="/">dAgora</a>
        </div>
        <div className="collapse navbar-collapse" id="navbar-collapse-1">
          <p className="navbar-text navbar-right" id="accountBalance">Account Balance: <span id="cb_balance">{accountBalance}</span></p>
          <form className="navbar-form navbar-right" id="search-form" role="search">
            <div className="form-group">
              <input type="text" className="form-control" placeholder="Search" />
            </div>
            <button type="submit" className="btn btn-default">Search</button>
          </form>
          <ul className="nav navbar-nav navbar-right">
            <li className="dropdown"><a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Products <span className="caret"></span></a>
              <ul className="dropdown-menu">
                {CategoryItems}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
