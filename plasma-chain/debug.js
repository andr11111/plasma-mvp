var utils = require('../utils');
var eu = require('ethereumjs-util');
var Transaction = require('./Transaction');
var Block = require('./Block');
var PlasmaChain = require('./PlasmaChain');
var rlp = require('rlp');
var su = require('eth-sig-util');

var address = '0xfd02ecee62797e75d86bcff1642eb0844afb28c7';
var key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';

function trans() {
  var blockNum1 = 0;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = address;
  var amount1 = 100;
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var t = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);  
  console.log("rlp:", eu.bufferToHex(rlp.encode(t.toArray())));
  t.sign1(key);
  console.log("hash:", eu.bufferToHex(t.hash));
  console.log("merkleHash:", eu.bufferToHex(t.merkleHash));
  console.log("sig1:", eu.bufferToHex(t.sig1));
  console.log("sender1:", eu.bufferToHex(t.sender1));
  console.log("address:", eu.bufferToHex(eu.privateToAddress(key)));  
}
//trans();

function genSingleTran() {
  var blockNum1 = 1;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = address;
  var amount1 = 5;
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var t = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);    
  return t;
}

function genTran1() {
  var blockNum1 = 0;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = address;
  var amount1 = 100;
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var t = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);    
  // t.sign1(key);
  return t;
}

function genTran2() {
  var blockNum1 = 1;
  var txIndex1 = 1;
  var oIndex1 = 1;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = address;
  var amount1 = 100;
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var t = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);  
  // t.sign1(key);  
  return t;
}

function block() {
  var t1 = genSingleTran();
  t1.sign1(key);
  // var t2 = genTran2();
  var b = new Block([t1]);  
  b.sign(key);
  
  var bRLP = b.toRLP();    
  console.log('rlp(orig):', eu.bufferToHex(bRLP));
  console.log('hash:', eu.bufferToHex(b.hash));
  console.log('tran1 merkle hash:', eu.bufferToHex(t1.merkleHash));
  // console.log('tran2 merkle hash:', eu.bufferToHex(t2.merkleHash));
  console.log('hash:', eu.bufferToHex(b.hash));
  console.log('merkilizeTransactionSet: ', eu.bufferToHex(b.merkilizeTransactionSet));
  console.log('sig: ', eu.bufferToHex(b.sig));
  
  // console.log(block);
}
block();


function testSig() {
  var hash = eu.sha3('123');
  var key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';
  console.log(eu.bufferToHex(hash));
  console.log(utils.sign(hash, key));
}

function testPlasmaChain() {

}

//testPlasmaChain();
