import React from 'react';

const Footer = ({contractBalance, contractAddress}) => {
  return (
    <footer className="footer-distributed">
      <div className="footer-right">
        <a href="https://twitter.com/paulszczesny0"><i className="fa fa-twitter hvr-pulse-grow"></i></a>
        <a href="https://www.linkedin.com/in/paulsz"><i className="fa fa-linkedin hvr-pulse-grow"></i></a>
        <a href="https://github.com/dsystems-io/dAgora"><i className="fa fa-github hvr-pulse-grow"></i></a>
      </div>
      <div className="footer-left">
        <p className="contract_address"><b>Contract</b>: <span id="c_address" className="c_address">{contractAddress}</span></p>
        <p className="contract_balance">
          <b>Balance</b>: <span id="c_balance">{contractBalance}</span> ETH
        </p>
      </div>
      </footer>
  );
}

export default Footer;
