/**
 * @module kad-spartacus/utils
 */

'use strict';

var crypto = require('crypto');

/**
 * Returns the nodeID
 * #getNodeIdFromPublicKey
 * @param {String} pubkey
 */
module.exports.getNodeIdFromPublicKey = function(pubkey) {
  var pubkeybuf;

  if (!Buffer.isBuffer(pubkey)) {
    pubkeybuf = new Buffer(pubkey, 'hex');
  } else {
    pubkeybuf = pubkey;
  }

  var pubhash = crypto.createHash('sha256').update(pubkeybuf).digest();
  var pubripe = crypto.createHash('rmd160').update(pubhash).digest();

  return pubripe.toString('hex');
};
