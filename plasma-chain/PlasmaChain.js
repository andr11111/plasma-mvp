const rlp = require('rlp');
const eu = require('ethereumjs-util');

const Block = require('./Block');
const { InvalidBlockMerkleException,
        InvalidBlockSignatureException,
        InvalidTxSignatureException, TxAlreadySpentException,
        TxAmountMismatchException } = require('./exceptions');
const Transaction = require('./Transaction');


class PlasmaChain {

    constructor(authority, rootChain) {
      this.rootChain = rootChain;
      this.authority = authority;
      this.blocks = {};
      this.currentBlockNumber = 1;
      this.currentBlock = new Block();
      this.pendingTransactions = [];

      // Register for deposit event listener
      var depositFilter = this.rootChain.on('Deposit');
      depositFilter.watch(this.applyDeposit);
    }

    applyDeposit(event) {
      var newOwner1 = event['args']['depositor'];
      var amount1 = event['args']['amount'];
      var blknum1 = event['args']['depositBlock'];
      var depositTx = new Transaction(blknum1, 0, 0, 0, 0, 0,
        newOwner1, amount1, eu.zeroAddress(), 0, 0);
      var depositBlock = new Block([depositTx]);
      // Add block validation
      this.blocks[this.currentBlockNumber] = depositBlock;
      this.currentBlockNumber += 1;
    }

    applyTransaction(transaction) {
      var tx = new Transaction.fromRLP(transaction);

      // Validate the transaction
      this.validateTx(tx);

      // Mark the inputs as spent
      this.markUtxoSpent(tx.blkNum1, tx.txIndex1, tx.oIndex1);
      this.markUtxoSpent(tx.blkNum2, tx.txIndex2, tx.oIndex2);

      this.currentBlock.transactionSet.append(tx);
    }

    validateTx(tx) {
      var inputs = [{blkNum: tx.blkNum1, txIndex: tx.txIndex1, oIndex: tx.oIndex1}, 
        {blkNum: tx.blkNum2, txIndex: tx.txIndex2, oIndex: tx.oIndex2}];

      var outputAmount = tx.amount1 + tx.amount2 + tx.fee;
      var inputAmount = 0;

      for (var { blkNum, txIndex, oIndex } in inputs) {
          // Assume empty inputs and are valid
          if (blkNum == 0) continue;

          var transaction = this.blocks[blkNum].transactionSet[txIndex];

          if (oIndex == 0) {
            var isValidSignature = tx.sig1 != eu.zeros(65) && transaction.newOwner1 == tx.sender1;
            var spent = transaction.spent1;
            inputAmount += transaction.amount1;
          } else {
            var isValidSignature = tx.sig2 != eu.zeros(65) && transaction.newOwner2 == tx.sender2;
            var spent = transaction.spent2;
            inputAmount += transaction.amount2;
          }
          if (spent) {
            throw new TxAlreadySpentException('failed to validate tx');
          }              
          if (!isValidSignature) {
            throw new InvalidTxSignatureException('failed to validate tx');
          }              
      }

      if (inputAmount != outputAmount) {
        throw new TxAmountMismatchException('failed to validate tx');
      }          
    }

    markUtxoSpent(blkNum, txIndex, oIndex) {
      if (blkNum == 0) return;

      if (oIndex == 0) {
        this.blocks[blkNum].transactionSet[txIndex].spent1 = true;
      } else {
        this.blocks[blkNum].transactionSet[txIndex].spent2 = true;
      }
    }

    submitBlock(block) {
      block = Block.fromRLP(block);
      if (block.merkilizeTransactionSet != self.currentBlock.merkilizeTransactionSet) {
        throw new InvalidBlockMerkleException('input block merkle mismatch with the current block');
      }          

      var isValidSignature = block.sig != eu.zeros(65) && block.sender == self.authority;
      if (!isValidSignature) {
        throw new InvalidBlockSignatureException('failed to submit block');
      }          

      this.rootChain.transact({'from': '0x' + eu.bufferToHex(this.authority)}).submitBlock(block.merkle.root, this.currentBlockNumber);
      // TODO: iterate through block and validate transactions
      this.blocks[this.currentBlockNumber] = this.currentBlock;
      this.currentBlockNumber += 1;
      this.currentBlock = new Block();
    }

    getTransaction(blkNum, txIndex) {
      return eu.bufferToHex(this.blocks[blkNum].transactionSet[txIndex].toRLP());
    }        

    getBlock(blkNum) {
      return eu.bufferToHex(this.blocks[blkNum].toRLP());
    }        

    getCurrentBlock() {
      return eu.bufferToHex(this.currentBlock.toRLP());
    }        

    getCurrentBlockNum() {
      return self.currentBlockNumber;
    }        
}

module.exports = PlasmaChain;