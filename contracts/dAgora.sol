/**
 * @title dAgoraShop
 * @author Paul Szczesny
 * A single shop in the dAgora marketplace.
 * Product segements based on the GS1 GPC classification system (http://www.gs1.org/gpc)
 */
contract dAgoraShop {
	enum OrderStatus { New, Pending, Shipped, Cancelled, Refunded, Complete }

	// Data structure representing a generic product
	struct Product {
		bytes32 dph; // Decentralized product hash
		address shop;
		string title;
		string description;
		uint gpcSegment; //Segement code from GS1 GPC specification
		uint price;
		uint stock;
		uint created;
	}
	struct Order {
		bytes32 id;
		address shop;
		address customer;
		uint totalCost;
		bytes32 dph;
		OrderStatus status;
		uint created;
		uint updated;
	}

	address public owner;
	address public dAgora;

	uint[] public gpcList; // Keep track of the GPC codes used in this store so we don't have to iterate over each one.
	mapping (bytes32 => Product) public productMap;
	mapping (uint => bytes32[]) public productCategoryMap; // Map GPC Segments to products for easier search
	mapping (bytes32 => Order) public orderMap;
	mapping (address => bytes32[]) public customerOrderMap;
	bytes32[] public orderList;
	string public name;

	// Check whether the current transaction is coming from the owner
	modifier isOwner() {
		if(msg.sender != owner) throw;
		_
	}

	// Check whether the current transaction is coming from the administrator
	modifier isAdmin() {
		if(msg.sender != dAgora) throw;
		_
	}

	function dAgoraShop(string _name) {
		owner = tx.origin;
		dAgora = msg.sender;
		name = _name;
	}

	function changeName(string _name) isAdmin {
		name = name;
	}

	/**
	 * Get number of elements in the category array
	 * @param gpcSegment The GPC segment to count products from
	 */
	function getProductCount(uint gpcSegment) returns(uint count) {
		return productCategoryMap[gpcSegment].length;
	}

	/**
	 * Get the length of the gpcList array
	 */
	function getGpcLength() returns(uint lenght){
		return gpcList.length;
	}

	function hasGpc(uint gpcSegment) returns(bool exists) {
		for(uint i = 0; i < gpcList.length; i++) {
			if(gpcList[i] == gpcSegment) return true;
		}
		return false;
	}

	/**
	 * Add a new product to the shop
	 * @param title The title of this product
	 * @param description The description for this product
	 * @param gpcSegment The GPC segment code for this product
	 * @param price The price of this product in Wei
	 * @param stock The beginning level of stock for this product
	 */
	function addProduct(string title, string description, uint gpcSegment, uint price, uint stock) isOwner returns (bytes32 dph) {
		bytes32 dphCode = sha3(title, gpcSegment, this);
		productMap[dphCode] = Product(dphCode, this, title, description, gpcSegment, price, stock, block.timestamp);
		productCategoryMap[gpcSegment].push(dphCode);
		if(!hasGpc(gpcSegment)) gpcList.push(gpcSegment);
		return dphCode;
	}

	/**
	 * Update a product from the shop
	 * @param dph The DPH code for the product
	 * @param description The description for this product
	 * @param price The price of this product in Wei
	 * @param stock The beginning level of stock for this product
	 */
	function updateProduct(bytes32 dph, string description, uint price, uint stock) isOwner returns (bool success) {
		Product product = productMap[dph];
		product.description = description;
		product.price = price;
		product.stock = stock;
		return true;
	}

	/**
	 * Remove a product from the store.
	 * @param dph The DPH code for the product to remove
	 * @dev What are the ramifications on Orders?
	 */
	function removeProduct(bytes32 dph) isOwner {
		Product product = productMap[dph];
		uint gpcSegment = product.gpcSegment;
		for (uint i = 0; i < productCategoryMap[gpcSegment].length; i++) {
			if(productCategoryMap[gpcSegment][i] == dph) {
				// Replace the removed product with the last product in the array
				productCategoryMap[gpcSegment][i] = productCategoryMap[gpcSegment][productCategoryMap[gpcSegment].length-1];
				// Delete the last product in the array
				productCategoryMap[gpcSegment].length--;
				break;
			}
		}
		delete productMap[dph];
		if(productCategoryMap[gpcSegment].length < 1) removeGpc(gpcSegment);
	}

	function removeGpc(uint gpcSegment) isOwner {
		delete productCategoryMap[gpcSegment];
		for (uint i = 0; i < gpcList.length; i++) {
			if(gpcList[i] == gpcSegment) {
				// Replace the removed product with the last product in the array
				gpcList[i] = gpcList[gpcList.length-1];
				// Delete the last product in the array
				gpcList.length--;
				break;
			}
		}
	}

	/**
	 * Purchase a product via it's ID
	 * @param index The product ID associated with the product to purchase
	 */
	function buy(bytes32 index) {
		uint price = productMap[index].price;
		if(msg.value < price) throw;
		if(msg.value > price) {
			if(!msg.sender.send(msg.value - price)) throw;
		}
		bytes32 id = sha3(index, msg.sender, this, block.timestamp);
		orderMap[id] = Order(id, this, msg.sender, price, index, OrderStatus.New, block.timestamp, block.timestamp);
		customerOrderMap[msg.sender].push(id);
		orderList.push(id);
		productMap[index].stock--;
	}

	/**
	 * Updates an order status by order ID
	 * @param orderId The order ID belonging to the customer
	 * @param newStatus The status to update this order to.
	 */
	function updateOrderStatus(bytes32 orderId, OrderStatus newStatus) isOwner {
		orderMap[orderId].status = newStatus;
		orderMap[orderId].updated = block.timestamp;
	}

	/**
	 * Withdraw funds from the contract
	 * @param recipient The Address to withdraw funds to
	 * @param amount The amount of funds to withdraw in Wei
	 */
	function withdraw(address recipient, uint amount) isOwner {
		if(!recipient.send(amount)) throw;
	}

	function kill() isOwner {
    selfdestruct(owner); // Kill contract
  }
}


/**
 * @title dAgora
 * @author Paul Szczesny
 * A decentralized marketplace.
 */
contract dAgora {

	mapping (string => address) shopMap;
	mapping (bytes32 => address) public productMap;
	uint public registrationFee;
	address public admin;

	// Check whether the current transaction is coming from the administrator
	modifier isAdmin() {
		if(msg.sender != admin) throw;
		_
	}

	// Ensure that the proper registration fee has been sent to create a new shop
	modifier checkRegistrationFee() {
		if(msg.value < registrationFee || msg.value > registrationFee) throw;
		_
	}

	// Check if the transaction was initiated by a registered shop
	modifier isShop(string shopName) {
		if(msg.sender != shopMap[shopName]) throw;
		_
	}

	// Check if a product has already been registered globally
	modifier isProductRegistered(string shopName, bytes32 dphCode) {
		if(productMap[dphCode] == shopMap[shopName]) throw;
	}

	function dAgora() {
		admin = msg.sender;
		registrationFee = 1000000000000000000; // 1 Ether
	}

	/**
	 * Check if a given name is availble for registration
	 */
	function isNameAvailable(string shopName) returns(bool available) {
		if(shopMap[shopName] == address(0x0)) return true;
		else return false;
	}

	function createShop(string shopName) checkRegistrationFee returns(dAgoraShop shopAddress) {
		if(!isNameAvailable(shopName)) throw;
		dAgoraShop newShop = new dAgoraShop(shopName);
		shopMap[shopName] = newShop;
		return newShop;
	}

	/**
	 * Add a product to the global registry
	 */
	function addProduct(string shopName, bytes32 dphCode) isShop(shopName) isProductRegistered(shopName, dphCode) returns (bool success) {
		productMap[dphCode] = shopMap[shopName];
	}

	/**
	 * Remove a product from the global registry
	 */
	function removeProduct(string shopName, bytes32 dphCode) isShop(shopName) isProductRegistered(shopName, dphCode) returns (bool success) {
		delete productMap[dphCode];
	}

	/**
	 * Withdraw funds from the contract
	 * @param recipient The Address to withdraw funds to
	 * @param amount The amount of funds to withdraw in Wei
	 */
	function withdraw(address recipient, uint amount) isAdmin {
		if(!recipient.send(amount)) throw;
	}

	function kill() isAdmin {
    suicide(admin); // Kill contract
  }
}
