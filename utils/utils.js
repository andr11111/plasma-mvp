var u = require('ethereumjs-util');
var su = require('eth-sig-util');

module.exports = {
  sign: function(hash, key) {
    var vrs = u.ecsign(u.toBuffer(hash), u.toBuffer(key));  
    var vrsBytes = su.concatSig(vrs.v, vrs.r, vrs.s);
    return vrsBytes;
  }
} 
