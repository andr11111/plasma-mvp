var utils = require('../utils');
var u = require('ethereumjs-util');
var Transaction = require('./Transaction');
var rlp = require('rlp');

var key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';

function trans() {
  var blockNum1 = 0;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = "0xfd02ecee62797e75d86bcff1642eb0844afb28c7";
  var amount1 = 100;
  var newOwner2 = u.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var t = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);  
  console.log("rlp:", u.bufferToHex(rlp.encode(t.toArray())));
  t.sign1(key);
  console.log("hash:", u.bufferToHex(t.hash));
  console.log("sig1:", u.bufferToHex(t.sig1));
}
trans();

function testSig() {
  var hash = u.sha3('123');
  var key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';
  console.log(u.bufferToHex(hash));
  console.log(utils.sign(hash, key));
}
