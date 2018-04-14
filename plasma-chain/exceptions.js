class ExtendableError extends Error {
  constructor(message) {
    message = message;
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else { 
      this.stack = (new Error(message)).stack; 
    }
  }
}  

// the transaction is already spent
class TxAlreadySpentException extends ExtendableError {}

// the signature of a tx is invalid
class InvalidTxSignatureException extends ExtendableError {}

// the signature of a block is invalid
class InvalidBlockSignatureException extends ExtendableError {}

// tx input total amount is not equal to output total amount
class TxAmountMismatchException extends ExtendableError {}

// merkle tree of a block is invalid
class InvalidBlockMerkleException extends ExtendableError {}

module.exports = {
  TxAlreadySpentException,
  InvalidTxSignatureException,
  InvalidBlockSignatureException,
  TxAmountMismatchException,
  InvalidBlockMerkleException
}