const PlasmaChain = require('../PlasmaChain');

const address = '0xfd02ecee62797e75d86bcff1642eb0844afb28c7';
const mockEventListener = {
  watch: (callback) => {}
}
const mockRootChain = {
  on: (event) => {return mockEventListener;}
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
  const depositBlock = plasma.blocks[plasma.currentBlockNumber - 1];
  const txSet = depositBlock.transactionSet;
  const tx = txSet[0];
  expect(txSet.length).toBe(1);
  expect(tx.newOwner1).toBe(address);
  expect(tx.amount1).toBe(5);
  expect(tx.blockNum1).toBe(1);
});

