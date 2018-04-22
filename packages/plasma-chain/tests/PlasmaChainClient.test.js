const PlasmaChain = require('../PlasmaChain');
const Transaction = require('../Transaction');
const Block = require('../Block');
const eu = require('ethereumjs-util');
const contractAPI = require('../../root-chain/api');
const PlasmaChainClient = require('../client');

const authority = {
  address: '0xfd02ecee62797e75d86bcff1642eb0844afb28c7',
  privateKey: '0x3bb369fecdc16b93b99514d8ed9c2e87c5824cf4a6a98d2e8e91b7dd0c063304'
}


let rootChain;
let client;

beforeEach(async () => {
  const rootNodeUrl = 'http://localhost:8545';
  rootChain = await contractAPI(rootNodeUrl);
  const plasmaNodeUrl = 'http://localhost:9545';
  client = new PlasmaChainClient(plasmaNodeUrl);
  
  const result = await rootChain.deposit({
    value: 5,
    from: authority.address
  });
  return result;
  // console.log('Deposit: ', result);
});

test.skip('Transaction should apply correctly', async () => {  
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

  const applyTxResult = await client.applyTransaction(eu.bufferToHex(txOrig.toRLP(true)));
  const submitBlockResult = await client.submitBlock(eu.bufferToHex(block.toRLP(true)));
  const depositBlock = Block.fromRLP(await client.getBlock(1));
  const transactionBlock = Block.fromRLP(await client.getBlock(2));  
  const txSet = transactionBlock.transactionSet;
  const tx = txSet[0];
  const getTransaction = await client.getTransaction(2, 0);
  const getBlock = await client.getBlock(2);
  const merkilizeTransactionSet =  eu.bufferToHex(transactionBlock.merkilizeTransactionSet);

  expect(applyTxResult).toBe('Success');
  expect(submitBlockResult).toBe('Success');
  expect(txSet.length).toBe(1);
  expect(tx.newOwner1).toBe(newOwner1);
  expect(tx.amount1).toBe(amount1);
  expect(tx.blockNum1).toBe(blockNum1);
  expect(getTransaction).toBe(eu.bufferToHex(txOrig.toRLP(true)));
  expect(getBlock).toBe(eu.bufferToHex(block.toRLP(false)));
  expect(merkilizeTransactionSet).toBe('0x91e19f42c4821aad428b682862945d6be715027f42a614d6090bf08a4e3c91a8');
}, 10000);
