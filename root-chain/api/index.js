var Web3 = require('web3');
var web3 = new Web3();
var contract = require('truffle-contract');

web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));
// Import our contract artifacts and turn them into usable abstractions.

var main_artifacts = require('../build/contracts/Main');

var MainContract = contract(main_artifacts);
MainContract.setProvider(web3.currentProvider);

MainContract.deployed().then(function(instance) {
  return instance.testCall.call();
}).then(function(balance) {
  console.log("balance = ", balance);
}).catch(function (reason) {
  console.log(reason);
});

