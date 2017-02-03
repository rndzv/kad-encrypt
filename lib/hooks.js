/**
 * @module kad-encrypt/hooks
 */

'use strict';

var kademlia = require('kad');
var crypto = require('crypto');
const KeyPair = require('./keypair')
var utils = require('./utils');

module.exports.NONCE_EXPIRE = 10000; // 10 seconds


/**
 * #verify
 * @param {Buffer} buffer
 * @param {CryptoContact} contact
 * @param {Function} next
 */
module.exports.verify = function(buffer, contact,  next) {
  if (utils.getNodeIdFromPublicKey(contact.pubkey).indexOf(contact.nodeID)) {
    return next(new Error('NodeID does not match public key'));
  }
  return next()
}

/**
 * #encrypt
 * @param {Object} keypair (optional)
 */
module.exports.encrypt = function(keypair) {
  return function(buffer, contact,  next) {
    //generate ephemeral keypair if none is given
    if (!(keypair instanceof KeyPair)) {
      keypair=new KeyPair();
    }

    var iv = Buffer.alloc(16)
    //first 4 bytes are unix time as big endian
    iv.writeUInt32BE(Math.round(Date.now()/1000),0)
    //next 12 are random bytes
    crypto.randomBytes(12).copy(iv,4)

    //copy buffer before passing to encrypt
    const plaintext = Buffer.from(buffer)
    var ciphertext;
    try {
      ciphertext = keypair.encrypt(contact.pubkey, iv, plaintext)
    } catch (err) {
      return next(new Error('Encryption error: '+err));
    }

    //now assign 'buffer' to a new buffer
    buffer = Buffer.concat([iv, ciphertext])

    next();

    return buffer;
  };
};

/**
 * #decrypt
 * @param {Object} keypair
 */
module.exports.decrypt = function(keypair) {
  return function(buffer,next) {
    //split buffer into iv and ciphertext
    const iv=Buffer.from(buffer.slice(0,16))
    const ciphertext=Buffer.from(buffer.slice(16))

    //get time from iv
    const time=iv.readUInt32BE(0)*1000

    //check it is within the window
    if ((Date.now() > time + module.exports.NONCE_EXPIRE) ||
        (Date.now() < time - module.exports.NONCE_EXPIRE)) {
      return next(new Error('Message time invalid'));
    }

    //then try to decrypt
    var plaintext;
    try {
      plaintext = keypair.decrypt(iv,ciphertext)
    } catch (err) {
      return next(new Error("Decryption error: " + err))
    }

    buffer = Buffer.from(plaintext)

    next();

    return buffer;
  };
};
