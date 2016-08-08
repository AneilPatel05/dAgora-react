var Web3 = require("web3");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  return accept(tx, receipt);
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("dAgoraShop error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("dAgoraShop error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("dAgoraShop contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of dAgoraShop: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to dAgoraShop.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: dAgoraShop not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "productMap",
        "outputs": [
          {
            "name": "dph",
            "type": "bytes32"
          },
          {
            "name": "shop",
            "type": "address"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "gpcSegment",
            "type": "uint256"
          },
          {
            "name": "price",
            "type": "uint256"
          },
          {
            "name": "stock",
            "type": "uint256"
          },
          {
            "name": "created",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "productCategoryMap",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "orderId",
            "type": "bytes32"
          },
          {
            "name": "newStatus",
            "type": "uint8"
          }
        ],
        "name": "updateOrderStatus",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "gpcSegment",
            "type": "uint256"
          }
        ],
        "name": "hasGpc",
        "outputs": [
          {
            "name": "exists",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "dAgora",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "orderList",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "customerOrderMap",
        "outputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "gpcList",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "dph",
            "type": "bytes32"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "price",
            "type": "uint256"
          },
          {
            "name": "stock",
            "type": "uint256"
          }
        ],
        "name": "updateProduct",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "index",
            "type": "bytes32"
          }
        ],
        "name": "buy",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "dph",
            "type": "bytes32"
          }
        ],
        "name": "removeProduct",
        "outputs": [],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "gpcSegment",
            "type": "uint256"
          }
        ],
        "name": "getProductCount",
        "outputs": [
          {
            "name": "count",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "bytes32"
          }
        ],
        "name": "orderMap",
        "outputs": [
          {
            "name": "id",
            "type": "bytes32"
          },
          {
            "name": "shop",
            "type": "address"
          },
          {
            "name": "customer",
            "type": "address"
          },
          {
            "name": "totalCost",
            "type": "uint256"
          },
          {
            "name": "dph",
            "type": "bytes32"
          },
          {
            "name": "status",
            "type": "uint8"
          },
          {
            "name": "created",
            "type": "uint256"
          },
          {
            "name": "updated",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "gpcSegment",
            "type": "uint256"
          },
          {
            "name": "price",
            "type": "uint256"
          },
          {
            "name": "stock",
            "type": "uint256"
          }
        ],
        "name": "addProduct",
        "outputs": [
          {
            "name": "dph",
            "type": "bytes32"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "getGpcLength",
        "outputs": [
          {
            "name": "lenght",
            "type": "uint256"
          }
        ],
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "recipient",
            "type": "address"
          },
          {
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "type": "function"
      },
      {
        "inputs": [],
        "type": "constructor"
      }
    ],
    "unlinked_binary": "0x606060405260008054600160a060020a03191633179055610e81806100246000396000f3606060405236156100da5760e060020a6000350463100b6ba281146100dc57806310b450141461012857806312d35eed1461015b5780632847fd0a1461018057806341c0e1b5146101dd5780636ea4516d146101fc57806376f75e7f1461020e5780638aff40681461024b5780638da5cb5b1461027e5780638f69da3714610290578063946f9005146102cd5780639c9a10611461033b578063a26ea49614610362578063ad4891ee14610389578063bef56e53146103a3578063dc60d3d2146103fb578063ec31eee6146104ab578063f3fef3a3146104c1575b005b600360208190526004803560009081526040902080549181015460058201546001830154600684015460078501546104e597600160a060020a0393909316956002810195930193919088565b6104af60043560243560046020526000828152604090208054829081101561000257506000908152602090200154905081565b6100da600435602435600054600160a060020a03908116339091161461069f57610002565b6106216004355b6000805b6002548110156106ca57826002600050828154811015610002576000919091527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace015414156106d557600191506106cf565b6100da600054600160a060020a0390811633909116146106dd57610002565b610635600154600160a060020a031681565b6104af60043560078054829081101561000257506000527fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c688015481565b6104af60043560243560066020526000828152604090208054829081101561000257506000908152602090200154905081565b610635600054600160a060020a031681565b6104af60043560028054829081101561000257506000527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace015481565b60408051602060248035600481810135601f81018590048502860185019096528585526106219581359591946044949293909201918190840183828082843750949650509335935050606435915050600080548190600160a060020a0390811633909116146106eb57610002565b6100da6004356000818152600360205260408120600501549034829010156107b357610002565b6100da6004356000805481908190600160a060020a03908116339091161461099557610002565b6104af600435600081815260046020526040902054919050565b60056020819052600480356000908152604090208054918101546003820154938201546001830154600284015460068501546007959095015461065297600160a060020a03938416969290931694929360ff16919088565b6104af6004808035906020019082018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843750506040805160208835808b0135601f8101839004830284018301909452838352979998604498929750919091019450909250829150840183828082843750949650509335935050606435915050608435600080548190600160a060020a039081163390911614610b5857610002565b6002545b60408051918252519081900360200190f35b6100da60043560243560005433600160a060020a03908116911614610e5657610002565b60408051898152600160a060020a03891660208201526080810186905260a0810185905260c0810184905260e0810183905261010091810182815288546002600182161585026000190190911604928201839052909160608301906101208401908a9080156105955780601f1061056a57610100808354040283529160200191610595565b820191906000526020600020905b81548152906001019060200180831161057857829003601f168201915b50508381038252885460026001821615610100026000190190911604808252602091909101908990801561060a5780601f106105df5761010080835404028352916020019161060a565b820191906000526020600020905b8154815290600101906020018083116105ed57829003601f168201915b50509a505050505050505050505060405180910390f35b604080519115158252519081900360200190f35b60408051600160a060020a03929092168252519081900360200190f35b60408051988952600160a060020a0397881660208a015295909616878601526060870193909352608086019190915260a085015260c084015260e083019190915251908190036101000190f35b6000828152600560208190526040909120908101805460ff19168317905542600791909101555b5050565b600091505b50919050565b60010161018b565b600054600160a060020a0316ff5b506000858152600360208181526040832087519281018054818652948390209194909360026001831615610100026000190190921691909104601f9081018490048301939192918a019083901061076557805160ff19168380011785555b506107959291505b808211156107af5760008155600101610751565b82800160010185558215610749579182015b82811115610749578251826000505591602001919060010190610777565b505060058101939093555060069190910155506001919050565b5090565b813411156107e95760405133600160a060020a031690600090348590039082818181858883f1935050505015156107e957610002565b50604080518381526c0100000000000000000000000033600160a060020a0381811683810260208681019190915230928316949094026034860152426048860181905286519586900360680186206101008701885280875286860193845286880194855260608701898152608088018b8152600060a08a0181815260c08b0186815260e08c019687528583526005808c528d84209c518d55985160018d8101805473ffffffffffffffffffffffffffffffffffffffff1990811690931790559a5160028e018054909216179055935160038c0155915160048b01559051958901805460ff1916909617909555516006888101919091559151600797909701969096559082529092529290208054928301808255919290918281838015829011610925578183600052602060002091820191016109259190610751565b50505060009283525060209091200181905560078054600181018083558281838015829011610967578183600052602060002091820191016109679190610751565b5050506000928352506020808320909101929092559283526003905250604090206006018054600019019055565b5050506000818152600360205260408120600481015490915b600082815260046020526040902054811015610a6d57604060002080548591908390811015610002576000918252602090912001541415610b145760008281526004602052604090208054600019810190811015610002579060005260206000209001600050546000838152600460205260409020805483908110156100025790600052602060002090016000505560008281526004602052604090208054600019810190811015610002579060005260206000209001600050600090555b60008481526003602052604081208181556001818101805473ffffffffffffffffffffffffffffffffffffffff1916905560028281018054858255939493909281161561010002600019011604601f819010610b1c57505b5060038201600050805460018160011615610100020316600290046000825580601f10610b3a57505b505060006004820181905560058201819055600682018190556007919091015550505050565b6001016109ae565b601f016020900490600052602060002090810190610ac59190610751565b601f016020900490600052602060002090810190610aee9190610751565b868530604051808480519060200190808383829060006004602084601f0104600f02600301f15090500183815260200182600160a060020a03166c01000000000000000000000000028152601401935050505060405180910390209050610100604051908101604052808281526020013081526020018881526020018781526020018681526020018581526020018481526020014281526020015060036000506000836000191681526020019081526020016000206000506000820151816000016000505560208201518160010160006101000a815481600160a060020a03021916908302179055506040820151816002016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610c9e57805160ff19168380011785555b50610cce929150610751565b82800160010185558215610c92579182015b82811115610c92578251826000505591602001919060010190610cb0565b50506060820151816003016000509080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610d2d57805160ff19168380011785555b50610d5d929150610751565b82800160010185558215610d21579182015b82811115610d21578251826000505591602001919060010190610d3f565b5050608082015160048281019190915560a0830151600583015560c0830151600683015560e09290920151600791909101556000868152602091909152604090208054600181018083558281838015829011610dcc57818360005260206000209182019101610dcc9190610751565b505050600092835250602090912001819055610de785610187565b1515610e4c5760028054600181018083558281838015829011610e39576000839052610e39907f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace908101908301610751565b5050506000928352506020909120018590555b9695505050505050565b604051600160a060020a03831690600090839082818181858883f1935050505015156106c65761000256",
    "updated_at": 1470643315099,
    "address": "0x301a9b5fd21057cd895a00d45e543b4822732d19",
    "links": {}
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "object") {
      Object.keys(name).forEach(function(n) {
        var a = name[n];
        Contract.link(n, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "dAgoraShop";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.1.2";

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.dAgoraShop = Contract;
  }
})();
