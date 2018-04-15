var eu = require('ethereumjs-util');
var su = require('eth-sig-util');

module.exports = {
  sign: function(hash, key) {
    var vrs = eu.ecsign(eu.toBuffer(hash), eu.toBuffer(key));  
    var vrsString = su.concatSig(vrs.v, vrs.r, vrs.s);
    return eu.toBuffer(vrsString);
  },

  getSender: function(hash, sig) {
    v = sig[64];
    if (v < 27) v += 27;
    r = sig.slice(0, 32);
    s = sig.slice(32, 64);
    pub = eu.ecrecover(hash, v, r, s);
    return eu.bufferToHex(eu.sha3(pub).slice(-20));
  }
} 
