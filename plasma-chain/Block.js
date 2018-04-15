var rlp = require('rlp');
var eu = require('ethereumjs-util');
var utils = require('../utils');
var { MerkleTree } = require('../utils/MerkleTree');
var Transaction = require('./Transaction');

class Block {
  constructor(transactionSet=[], sig) {
    this.transactionSet = transactionSet;
    this.sig = sig || eu.zeros(65);
    this.merkle = null;
  }
  
  get hash() {
    return eu.sha3(this.toRLP(false));
  }
        
  sign(key) {
    this.sig = utils.sign(this.hash, key);
  }

  get sender() {
    return utils.getSender(this.hash, this.sig)
  }

  get merkilizeTransactionSet() {    
    var hashedTransactionSet = this.transactionSet.map(t => t.merkleHash);
    this.merkle = new MerkleTree(16, hashedTransactionSet, true);
    return this.merkle.root;
  }

  toArray(withSigs = false) {
    var arr = [
      this.transactionSet.map(t => t.toArray(true))
    ];
    if (withSigs) {
      arr.push(this.sig);
    } else {
      arr.push(eu.zeros(65));
    }
    return arr;
  }

  static fromArray(arr) {
    var transactionSet = arr[0].map(t => Transaction.fromArray(t));
    var sig = arr[1];

    return new Block(transactionSet, sig);
  }
  
  toRLP(withSigs = false) {
    return rlp.encode(this.toArray(withSigs));
  }

  static fromRLP(rlpObj) {
    var blockArray = rlp.decode(rlpObj);
    return Block.fromArray(blockArray);
  }
}

module.exports = Block;