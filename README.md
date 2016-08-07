# dAgora + React
Decentralized marketplace built with Ethereum + React.

## Dependencies
* [Node.js & npm](https://nodejs.org)
* [Truffle](https://github.com/ConsenSys/truffle)
* [Geth](https://github.com/ethereum/go-ethereum/wiki/geth) or [testrpc](https://github.com/ethereumjs/testrpc)
* [IPFS](https://ipfs.io/)

## First Run
*  `npm install`
*  `truffle compile`
*  `truffle migrate`
*  `truffle serve`

## Test
* `truffle test`

## Preview
![alt text](https://raw.githubusercontent.com/dsystems-io/dagora/master/app/images/preview.png "App Preview")

## Concepts
The structure of this contract and dApp relies upon a few concepts that deserve explanation:
* **Decentralized Product Hash (DPH)**: We've indexed the products in the productList using a SHA3 hash of the title, [GPC Segment](http://www.gs1.org/gpc), and creator's address. This is an early attempt at standardizing product ID's/Indexes for the purpose of making searchability and provable identity possible in the future. Suggestions for improving this standard are welcome.
* **Global Product Classification (GPC)**: For prodcut categorization we are relying on the [GS1 GPC standard](http://www.gs1.org/gpc) of catetegorization to make our marketplace compatible with existing standards.

## Current Limitations
* Single product purchases (no multi-product orders)
* All pricing is strictly in ETH
* Single merchant per contract
* No search
* No ability integrate delivery of physical items

## Unsolved Challenges
1. Dealing with indexes when products are removed.
  * In order to iterate over products, We've implemented a index to map a uint => DPH. This will create issues when products are removed and the index is no longer sequential.
  * **Proposal 1**: Keep a seperate array of open productIndex's that can be used when new products are added. So instead of a new product creating a brand new index, it first checks to see whether there is an open slot available.
2. Providing searchability to products and orders.
  * We currently don't have an easy way for looking through the productList and attempting to match keywords to the fields in the Prodcut struct. Using the **DPH** allows for some primitive search, assuming the user knows the Title, Category, and Creator address.
  * The same is true for Orders
3. Maintaining privacy of orders so that only the order initiator and merchant can access order details.
  * As all order details exist on the public blockchain, it is feasible for anyone to find access to the order data of any user.


## Todo
* Input Validation (UX)
* Test Coverage
* Function to update all product fields (Contract + UX)
* Function to update order status (Contract + UX)
* Function to remove products (Contract + UX)
* Display all orders to administrator (UX)
* Display Customer orders (UX)
* Support for co-purchasing (Contract + UX)
* Support for merchants (Contract + UX)
* Support for 3rd-party tokens (Contract + UX)
* Add-to-Cart functionality (Contract + UX)
* Handle non-scarce products that do not need stock counts
* Support for multiple categories per product (Contract)
* Support delivery of products and tracking
* Real image support via IPFS
* Create Account Switcher to pay from non-CB accounts (UX)
* Ad-infinitum!

## License
[MIT](https://github.com/dsystems-io/dagora/blob/master/LICENSE)
