/**
 * @title dAgora
 * @author Paul Szczesny
 * A decentralized marketplace.
 * Product segements based on the GS1 GPC classification system (http://www.gs1.org/gpc)
 */
contract dAgora {
	enum OrderStatus { New, Pending, Shipped, Cancelled, Refunded, Complete }

	// Data structure representing a generic product
	struct Product {
		bytes32 dph; // Decentralized product hash
		string title;
		string description;
		uint gpcSegment; //Segement code from GS1 GPC specification
		uint price;
		uint stock;
	}
	struct Order {
		uint id;
		address customer;
		uint totalCost;
		bytes32 dph;
		OrderStatus status;
	}

	address public admin;
	mapping (bytes32 => Product) public productList;
	mapping (uint => bytes32) public productMap;
	uint public productCount;
	mapping (address => mapping (uint => Order) ) public orderList;
	mapping (address => uint) public orderCount; // Maintains an order counter for each customer so that the orderList mapping can be iterated

	// Check whether the current transaction is coming from the administrator
	modifier isAdmin() {
		if(msg.sender != admin) throw;
		_
	}

	function dAgora() {
		admin = msg.sender;
		productCount = 0;
	}

	/**
	 * Add a new product to the marketplace
	 * @param price The price of this product in Wei
	 * @param stock The beginning level of stock for this product
	 */
	function addProduct(string title, string description, uint gpcSegment, uint price, uint stock) isAdmin returns (bool success) {
		bytes32 dphCode = sha3(title, gpcSegment, msg.sender);
		uint nextIndex = productCount + 1;
		productCount = nextIndex;
		productMap[nextIndex] = dphCode;
		productList[dphCode] = Product(dphCode, title, description, gpcSegment, price, stock);
		return true;
	}

	/**
	 * Purchase a product via it's ID
	 * @param index The product ID associated with the product to purchase
	 */
	function buy(bytes32 index) {
		uint price = productList[index].price;
		if(msg.value < price) throw;
		if(msg.value > price) {
			if(!msg.sender.send(msg.value - price)) throw;
		}
		uint nextId = orderCount[msg.sender] + 1;
		orderList[msg.sender][nextId] = Order(nextId, msg.sender, price, index, OrderStatus.New);
		orderCount[msg.sender]++;
		productList[index].stock--;
	}

	/**
	 * Withdraw funds from the contract
	 * @param recipient The Address to withdraw funds to
	 * @param amount The amount of funds to withdraw in Wei
	 */
	function withdraw(address recipient, uint amount) isAdmin {
		if(!recipient.send(amount)) throw;
	}

	/**
	 * Update the stock of a product by DPH
	 * @param productDph The product DPH of the product to update
	 * @param newStock The new stock value
	 */
	function updateProductStock(bytes32 productDph, uint newStock) isAdmin {
		productList[productDph].stock = newStock;
	}

	/**
	 * Updates an order status by customer and order ID
	 * @param customer The address of the customer belonging to this order
	 * @param orderIndex The order ID belonging to the customer
	 * @param newStatus The status to update this order to.
	 */
	function updateOrderStatus(address customer, uint orderIndex, OrderStatus newStatus) isAdmin {
		orderList[customer][orderIndex].status = newStatus;
	}

	/**
	 * TODO
	 * @dev Need to deal with the fact that sequential numbered indexes are being used
	 */
	function removeProduct() isAdmin {

	}

	function kill() isAdmin {
    suicide(admin); // Kill contract
  }
}
