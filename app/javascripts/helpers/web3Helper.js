if(typeof web3 !== 'undefined')
  var web3 = new Web3(web3.currentProvider);
else
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

if(typeof web3.eth.defaultAccount == 'undefined') web3.eth.defaultAccount = web3.eth.accounts[0];

web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval |= 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
      try {
          var receipt = web3.eth.getTransactionReceipt(txnHash);
          if (receipt == null) {
              setTimeout(function () {
                  transactionReceiptAsync(txnHash, resolve, reject);
              }, interval);
          } else {
              resolve(receipt);
          }
      } catch(e) {
          reject(e);
      }
  };

  return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
  });
};

export default web3;
