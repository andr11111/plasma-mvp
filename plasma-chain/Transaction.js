var rlp = require('rlp');
var u = require('ethereumjs-util');
var su = require('eth-sig-util');
var sign = require('../utils').sign;

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
    this.sig1 = sig1 || u.zeros(65);

    // Input 2
    this.blockNum2 = blockNum2;
    this.txIndex2 = txIndex2;
    this.oIndex2 = oIndex2;
    this.sig2 = sig2 || u.zeros(65);

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
    return u.sha3(rlp.encode(this.toArray()));
  }
        
  get merkleHash() {
    return u.sha3(this.hash + this.sig1 + this.sig2);
  }

  sign1(key) {
    this.sig1 = sign(this.hash, key);
  }

  sign2(key) {
    this.sig2 = sign(this.hash, key);
  }

  get isSingleUtxo() {
    return this.blockNum2 === 0;    
  }
  
  get sender1() {
    return get_sender(this.hash, self.sig1);
  }
  
  get sender2() {
    return get_sender(this.hash, this.sig2); 
  }

  toArray() {
    return [
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
  }
}

module.exports = Transaction;