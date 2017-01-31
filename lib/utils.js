/**
 * @module kad-encrypt/utils
 */

'use strict';

var crypto = require('crypto');

/**
 * Returns the nodeID
 * #getNodeIdFromPublicKey
 * @param {String} pubkey
 */
module.exports.getNodeIdFromPublicKey = function(pubkey) {
  if (!Buffer.isBuffer(pubkey)) {
    try {
      pubkey = new Buffer(pubkey, 'hex');
    } catch (err) {
      return err;
    }

  }

  var pubhash = crypto.createHash('sha256').update(pubkey).digest();
  var pubripe = crypto.createHash('rmd160').update(pubhash).digest();

  return pubripe.toString('hex');
};
