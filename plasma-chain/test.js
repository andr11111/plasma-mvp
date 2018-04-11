var utils = require('../utils');
var u = require('ethereumjs-util');
var Transaction = require('./Transaction');

var key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';

function trans() {
  var blockNum1 = 0;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = null;
  var txIndex2 = null;
  var oIndex2 = null;
  var newOwner1 = "0xfd02ecee62797e75d86bcff1642eb0844afb28c7";
  var amount1 = 100;
  var newOwner2 = null;
  var amount2 = null;
  var fee = 0;
  var sig1 = null;
  var sig2 = null;
  var t = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee, sig1, sig2);
  t.sign1(key);
  console.log(t.sig1);
}
trans();

function testSig() {
  var hash = u.sha3('123');
  var key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';
  console.log(u.bufferToHex(hash));
  console.log(utils.sign(hash, key));
}
