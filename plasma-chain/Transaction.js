var rlp = require('rlp');
var eu = require('ethereumjs-util');
var su = require('eth-sig-util');
var utils = require('../utils');

class Transaction {
  constructor(blockNum1, txIndex1, oIndex1, 
              blockNum2, txIndex2, oIndex2, 
              newOwner1, amount1, 
              newOwner2, amount2, 
              fee, sig1, sig2) {
    // Input 1
    this.blockNum1 = blockNum1;
    this.txIndex1 = txIndex1;
    this.oIndex1 = oIndex1;
    this.sig1 = sig1 || eu.zeros(65);

    // Input 2
    this.blockNum2 = blockNum2;
    this.txIndex2 = txIndex2;
    this.oIndex2 = oIndex2;
    this.sig2 = sig2 || eu.zeros(65);

    // Outputs
    this.newOwner1 = su.normalize(newOwner1);
    this.amount1 = amount1;

    this.newOwner2 = su.normalize(newOwner2);
    this.amount2 = amount2;

    // Fee
    this.fee = fee;

    this.confirmation1 = null;
    this.confirmation2 = null;

    this.spent1 = null;
    this.spent2 = null;   
  }
  
  get hash() {
    return eu.sha3(rlp.encode(this.toArray()));
  }
        
  get merkleHash() {
    return eu.sha3(this.hash + this.sig1 + this.sig2);
  }

  sign1(key) {
    this.sig1 = utils.sign(this.hash, key);
  }

  sign2(key) {
    this.sig2 = utils.sign(this.hash, key);
  }

  get isSingleUtxo() {
    return this.blockNum2 === 0;    
  }
  
  get sender1() {
    return utils.getSender(this.hash, this.sig1);
  }
  
  get sender2() {
    return utils.getSender(this.hash, this.sig2); 
  }

  toArray(withSigs = false) {
    var arr = [
      this.blockNum1,
      this.txIndex1,
      this.oIndex1,
      this.blockNum2,
      this.txIndex2,
      this.oIndex2,
      this.newOwner1,
      this.amount1,
      this.newOwner2,
      this.amount2,
      this.fee
    ];

    if (withSigs) {
      arr.push(this.sig1);
      arr.push(this.sig2);
    }

    return arr;
  }

  toRLP(withSigs = false) {
    return rlp.encode(this.toArray(withSigs));
  }

  static fromArray(arr) {
    var blockNum1 = eu.bufferToInt(arr[0]);
    var txIndex1 = eu.bufferToInt(arr[1]);
    var oIndex1 = eu.bufferToInt(arr[2]);

    var blockNum2 = eu.bufferToInt(arr[3]);
    var txIndex2 = eu.bufferToInt(arr[4]);
    var oIndex2 = eu.bufferToInt(arr[5]);

    var newOwner1 = eu.bufferToHex(arr[6]);
    var amount1 = eu.bufferToInt(arr[7]); 

    var newOwner2 = eu.bufferToHex(arr[8]);
    var amount2 = eu.bufferToInt(arr[9]);

    var fee = eu.bufferToInt(arr[10]);

    var sig1 = arr[11];
    var sig2 = arr[12];

    return new Transaction(
      blockNum1, txIndex1, oIndex1, 
      blockNum2, txIndex2, oIndex2, 
      newOwner1, amount1, 
      newOwner2, amount2, 
      fee, sig1, sig2);
  }

  static fromRLP(rlpObj) {
    var txArray = rlp.decode(rlpObj);
    return Transaction.fromArray(txArray);
  }
}

module.exports = Transaction;