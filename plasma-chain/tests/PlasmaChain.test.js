const PlasmaChain = require('../PlasmaChain');
const Transaction = require('../Transaction');
const Block = require('../Block');
const eu = require('ethereumjs-util');

const address = '0xfd02ecee62797e75d86bcff1642eb0844afb28c7';
const key = '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304';
const mockEventListener = {
  watch: (callback) => {}
}
const mockRootChain = {
  on: (event) => {return mockEventListener;},
  transact: () => {return {submitBlock: () => {}}}
}

test('Deposit should apply correctly', () => {
  const plasma = new PlasmaChain(address, mockRootChain);
  const depositEvent = {args: {
    depositor: address,
    amount: 5,
    depositBlock: 1
  }}
  plasma.applyDeposit(depositEvent);
  const depositBlock = plasma.blocks[plasma.currentBlockNumber - 1];
  const txSet = depositBlock.transactionSet;
  const tx = txSet[0];
  expect(txSet.length).toBe(1);
  expect(tx.newOwner1).toBe(address);
  expect(tx.amount1).toBe(5);
  expect(tx.blockNum1).toBe(1);
});


test('Transaction should apply correctly', () => {
  
  const plasma = new PlasmaChain(address, mockRootChain);
  const depositEvent = {args: {
    depositor: address,
    amount: 5,
    depositBlock: 1
  }}
  plasma.applyDeposit(depositEvent);

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
  var txOrig = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);
  txOrig.sign1(key);
  block = new Block([txOrig])
  block.sign(key);

  plasma.applyTransaction(txOrig.toRLP(true));  
  
  plasma.submitBlock(block.toRLP(true));
  
  const depositBlock = plasma.blocks[1];
  const transactionBlock = plasma.blocks[2];
  const txSet = transactionBlock.transactionSet;
  const tx = txSet[0];
  const getTransaction = plasma.getTransaction(2, 0)
  const merkilizeTransactionSet =  eu.bufferToHex(transactionBlock.merkilizeTransactionSet);

  expect(txSet.length).toBe(1);
  expect(tx.newOwner1).toBe(address);
  expect(tx.amount1).toBe(amount1);
  expect(tx.blockNum1).toBe(blockNum1);
  expect(depositBlock.transactionSet[0].spent1).toBe(true);
  expect(getTransaction).toBe(eu.bufferToHex(txOrig.toRLP(true)));
  expect(merkilizeTransactionSet).toBe('0x91e19f42c4821aad428b682862945d6be715027f42a614d6090bf08a4e3c91a8');
});

test('Invalid transaction should cause error', () => {
  const plasma = new PlasmaChain(address, mockRootChain);
  const depositEvent = {args: {
    depositor: address,
    amount: 5,
    depositBlock: 1
  }}
  plasma.applyDeposit(depositEvent);

  var blockNum1 = 1;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = address;
  var amount1 = 6; //Amount too high
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var txOrig = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);
  txOrig.sign1(key);
  expect(() => {
    plasma.applyTransaction(txOrig.toRLP(true));
  }).toThrow();
});