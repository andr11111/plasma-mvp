const PlasmaChain = require('../PlasmaChain');
const Transaction = require('../Transaction');
const Block = require('../Block');
const eu = require('ethereumjs-util');
const contractAPI = require('../../root-chain/api');
const client = require('../client');

const authority = {
  address: '0xfd02ecee62797e75d86bcff1642eb0844afb28c7',
  privateKey: '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304'
}

const rootNodeUrl = 'http://localhost:8545';

const mockEventListener = {
  watch: (callback) => {}
};

const mockRootChain = {
  Deposit: (event) => {return mockEventListener;},
  submitBlock: () => {}
};

test('sending money to a contract', async () => {  
  const rootChain = await contractAPI(rootNodeUrl);
  const plasma = new PlasmaChain(authority, rootChain);

  console.log("sent transaction");
  const depositAmount = contractAPI.web3.toWei("0.00005", "ether");
  const result = await rootChain.deposit({
    value: depositAmount,
    from: authority.address
  });
  // console.log("result = ", result);
  expect(result.receipt.status).toBe('0x01');

  // console.log('block:', plasma.blocks[1]);
  const depositBlock = Block.fromRLP(plasma.getBlock(1));
  expect(depositBlock.transactionSet[0].amount1.toString()).toBe(depositAmount);
  //console.log(depositBlock);  
  
        
}, 100000);

test('Deposit should apply correctly', async () => {
  const rootChain = await contractAPI(rootNodeUrl);
  const plasma = new PlasmaChain(authority, rootChain);
  plasma.applyDeposit(authority.address, 5, 1);
  const depositBlock = plasma.blocks[plasma.currentBlockNumber - 1];
  const txSet = depositBlock.transactionSet;
  const tx = txSet[0];
  expect(txSet.length).toBe(1);
  expect(tx.newOwner1).toBe(authority.address);
  expect(tx.amount1).toBe(5);
  expect(tx.blockNum1).toBe(1);
});


test('Transaction should apply correctly', () => {

  const plasma = new PlasmaChain(authority, mockRootChain);
  plasma.applyDeposit(authority.address, 5, 1);

  var blockNum1 = 1;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = authority.address;
  var amount1 = 5;
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  let txOrig = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);
  txOrig.sign1(authority.privateKey);
  let block = new Block([txOrig]);
  block.sign(authority.privateKey);

  plasma.applyTransaction(txOrig.toRLP(true));

  plasma.submitBlock(block.toRLP(true));

  const depositBlock = plasma.blocks[1];
  const transactionBlock = plasma.blocks[2];
  const txSet = transactionBlock.transactionSet;
  const tx = txSet[0];
  const getTransaction = plasma.getTransaction(2, 0);
  const getBlock = plasma.getBlock(2);
  const merkilizeTransactionSet =  eu.bufferToHex(transactionBlock.merkilizeTransactionSet);

  expect(txSet.length).toBe(1);
  expect(tx.newOwner1).toBe(authority.address);
  expect(tx.amount1).toBe(amount1);
  expect(tx.blockNum1).toBe(blockNum1);
  expect(depositBlock.transactionSet[0].spent1).toBe(true);
  expect(getTransaction).toBe(eu.bufferToHex(txOrig.toRLP(true)));
  expect(getBlock).toBe(eu.bufferToHex(block.toRLP(false)));
  expect(merkilizeTransactionSet).toBe('0x91e19f42c4821aad428b682862945d6be715027f42a614d6090bf08a4e3c91a8');
});

test('Invalid transaction should cause error', () => {
  const plasma = new PlasmaChain(authority, mockRootChain);
  plasma.applyDeposit(authority.address, 5, 1);

  var blockNum1 = 1;
  var txIndex1 = 0;
  var oIndex1 = 0;
  var blockNum2 = 0;
  var txIndex2 = 0;
  var oIndex2 = 0;
  var newOwner1 = authority.address;
  var amount1 = 6; //Amount too high
  var newOwner2 = eu.zeroAddress();
  var amount2 = 0;
  var fee = 0;
  var txOrig = new Transaction(blockNum1, txIndex1, oIndex1, blockNum2, txIndex2, oIndex2, newOwner1, amount1, newOwner2, amount2, fee);
  txOrig.sign1(authority.privateKey);
  expect(() => {
    plasma.applyTransaction(txOrig.toRLP(true));
  }).toThrow();
});
