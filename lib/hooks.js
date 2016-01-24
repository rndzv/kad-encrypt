/**
 * @module kad-spartacus/hooks
 */

'use strict';

var kademlia = require('kad');

module.exports.NONCE_EXPIRE = 10000; // 10 seconds

/**
 * Used as a transport.before('serialize') hook
 * #sign
 * @param {Object} keypair
 */
module.exports.sign = function(keypair) {
  return function(message, next) {
    var nonce = Date.now();
    var contract = message.id + nonce;
    var signature = new Buffer(keypair.sign(contract), 'hex');

    if (kademlia.Message.isRequest(message)) {
      message.params.__nonce = nonce;
      message.params.__signature = signature;
    } else {
      message.result.__nonce = nonce;
      message.result.__signature = signature;
    }

    next();
  };
};

/**
 * Used as a transport.before('receive') hook
 * #verify
 * @param {Object} keypair
 */
module.exports.verify = function(keypair) {
  return function(message, contact, next) {
    var nonce, contract, signature;

    if (kademlia.Message.isRequest(message)) {
      nonce = message.params.__nonce;
      signature = message.params.__signature;
    } else {
      nonce = message.result.__nonce;
      signature = message.result.__signature;
    }

    if (Date.now() > (module.exports.NONCE_EXPIRE + nonce)) {
      return next(new Error('Message signature expired'));
    }

    contract = message.id + nonce;

    if (!keypair.verify(contract, contact.pubkey, signature)) {
      return next(new Error('Signature verification failed'));
    }

    next();
  };
};
