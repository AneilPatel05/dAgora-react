import React from 'react';

const Navigation = ({accountBalance}) => {
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
        <ul className="nav navbar-nav navbar-right">
          <li><a href="#">My Orders</a></li>
        </ul>
        <form className="navbar-form navbar-right" role="search">
          <div className="form-group">
            <input type="text" className="form-control" placeholder="Search" />
          </div>
          <button type="submit" className="btn btn-default">Search</button>
        </form>
      </div>
    </div>
  </nav>
  );
}

export default Navigation;
