var eu = require('ethereumjs-util');

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

// raise when a leaf is not in the merkle tree
class MemberNotExistException extends ExtendableError { }

class Node {
  constructor(data, left = null, right = null) {
    this.data = data
    this.left = left
    this.right = right
  }
}

class MerkleTree {

  constructor(depth, leaves = [], hashed = false) {
    if (depth < 1) throw new Error('depth should be at least 1');

    this.depth = depth;
    this.leafCount = 2 ** depth;
    this.hashed = hashed;

    if (leaves.length > this.leafCount) throw new Error('num of leaves exceed max avaiable num with the depth');

    if (!hashed) leaves = leaves.map(l => eu.sha3(l));

    this.leaves = leaves.concat(Array.from(Array(this.leafCount-leaves.length), () => eu.zeros(32)));
    this.tree = [this.createNodes(this.leaves)];
    this.createTree(this.tree[0]);
  }

  createNodes(leaves) {
    return leaves.map(l => new Node(l));
  }

  createTree(leaves) {
    if (leaves.length == 1) {
      this.root = leaves[0].data;
      return this.root;
    }
    var nextLevel = leaves.length;
    var treeLevel = [];
    for (var i = 0; i < nextLevel; i = i + 2) {
      var combined = eu.sha3(Buffer.concat([leaves[i].data, leaves[i + 1].data]));
      var nextNode = new Node(combined, leaves[i], leaves[i + 1]);
      treeLevel.push(nextNode);
    }
    this.tree.push(treeLevel);
    this.createTree(treeLevel);
  }

  checkMembership(leaf, index, proof) {
    if (!this.hashed) leaf = eu.sha3(leaf);
    var computedHash = leaf;
    for (i = 0; i < this.depth * 32; i += 32) {
      var segment = proof.slice(i, i + 32);
      if (index % 2 == 0) {
        computedHash = eu.sha3(computedHash + segment);
      } else {
        computedHash = eu.sha3(segment + computedHash);
      }
      index = index / 2;
    }
    return computedHash == this.root;
  }

  createMembershipProof(leaf) {
    if (!this.hashed) leaf = eu.sha3(leaf);
    if (!this.isMember(leaf)) {
      throw new MemberNotExistException('leaf is not in the merkle tree');
    }

    var index = this.leaves.indexOf(leaf);
    var proof = new Buffer();    
    for (i = 0; i < this.depth; i++) {
      var siblingIndex;
      if (index % 2 == 0) {
        siblingIndex = index + 1;
      } else {
        siblingIndex = index - 1;
      }
      index = index / 2;
      proof.push(this.tree[i][siblingIndex].data);
    }
    return proof
  }

  isMember(leaf) {
    return this.leaves.includes(leaf);
  }

  notMember(leaf) {
    return !this.isMember(leaf);
  }
}

module.exports = {
  MerkleTree: MerkleTree,
  Node: Node
}