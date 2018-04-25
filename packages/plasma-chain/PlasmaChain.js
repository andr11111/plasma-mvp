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
      this.blocks = [];
      this.currentBlockNumber = 1;
      this.currentBlock = new Block();
      this.pendingTransactions = [];

      // Register for deposit event listener
      this.rootChain.Deposit({}, (error, event) => {
        // console.log("received an event", event);
        let { depositor, amount, depositBlock } = event['args'];
        amount = amount.toNumber();
        depositBlock = depositBlock.toNumber();
        this.applyDeposit(depositor, amount, depositBlock);
      });
    }

    applyDeposit(depositor, amount, blockNum) {
      // console.log('apply deposit:', depositor, amount, blockNum)
      var depositTx = new Transaction(blockNum, 0, 0, 0, 0, 0,
        depositor, amount, eu.zeroAddress(), 0, 0);
      var depositBlock = new Block([depositTx]);
      // Add block validation
      this.blocks[this.currentBlockNumber] = depositBlock;
      this.currentBlockNumber += 1;
    }

    applyTransaction(transaction) {
      var tx = Transaction.fromRLP(transaction);

      // Validate the transaction
      this.validateTx(tx);

      // Mark the inputs as spent
      this.markUtxoSpent(tx.blockNum1, tx.txIndex1, tx.oIndex1);
      this.markUtxoSpent(tx.blockNum2, tx.txIndex2, tx.oIndex2);

      this.currentBlock.transactionSet.push(tx);
    }

    validateTx(tx) {
      var inputs = [{blkNum: tx.blockNum1, txIndex: tx.txIndex1, oIndex: tx.oIndex1},
        {blkNum: tx.blockNum2, txIndex: tx.txIndex2, oIndex: tx.oIndex2}];

      var outputAmount = tx.amount1 + tx.amount2 + tx.fee;
      var inputAmount = 0;

      for (const key in inputs) {
        const input = inputs[key];
        const { blkNum, txIndex, oIndex } = input;
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

    submitCurrentBlock() {
      const currentBlock = Block.fromRLP(this.currentBlock.toRLP(true));
      currentBlock.sign(this.authority.privateKey);
      this.submitBlock(currentBlock.toRLP(true));
    }

    submitBlock(block) {
      block = Block.fromRLP(block);
      if (!block.merkilizeTransactionSet.equals(this.currentBlock.merkilizeTransactionSet)) {
        throw new InvalidBlockMerkleException('input block merkle mismatch with the current block');
      }

      var isValidSignature = !block.sig.equals(eu.zeros(65)) && block.sender === this.authority.address;
      if (!isValidSignature) {
        throw new InvalidBlockSignatureException('failed to submit block');
      }

      console.log("will submit", eu.bufferToHex(block.merkle.root), this.authority.address);
      this.rootChain.submitBlock(eu.bufferToHex(block.merkle.root), {
        from: this.authority.address
      });
      // TODO: iterate through block and validate transactions
      this.blocks[this.currentBlockNumber] = this.currentBlock;
      this.currentBlockNumber += 1;
      this.currentBlock = new Block();
    }

    getTransaction(blkNum, txIndex) {
      return eu.bufferToHex(this.blocks[blkNum].transactionSet[txIndex].toRLP(true));
    }

    getBlock(blkNum) {
      const block = this.blocks[blkNum];
      if (block) {
        return eu.bufferToHex(block.toRLP(true));
      } else {
        throw new Error('Invalid block number');
      }
    }

    getCurrentBlock() {
      return eu.bufferToHex(this.currentBlock.toRLP(true));
    }

    getCurrentBlockNum() {
      return this.currentBlockNumber;
    }
}

module.exports = PlasmaChain;
