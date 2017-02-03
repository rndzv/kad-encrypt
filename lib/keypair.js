/**
 * @class kad-encrypt/keypair
 */

'use strict';

var assert = require('assert');
var crypto = require('crypto');
var kademlia = require('kad');
var utils = require('./utils');

const KEY_CURVE='secp256k1'
const ENCRYPTION_ALGORITHM='aes-256-gcm'

/**
 * Creates a spartacus context
 * @constructor
 * @param {String|Buffer} privkey
 */
function KeyPair(privkey) {
  if (!(this instanceof KeyPair)) {
    return new KeyPair(privkey);
  }

  this._keypair = crypto.createECDH(KEY_CURVE);
  if (privkey) {
    this._keypair.setPrivateKey(privkey,'hex');
  } else {
    this._keypair.generateKeys();
  }
}

/**
 * Returns the private key
 * #getPrivateKey
 */
KeyPair.prototype.getPrivateKey = function() {
  return this._keypair.getPrivateKey('hex')
};

/**
 * Returns the public key
 * #getPublicKey
 */
KeyPair.prototype.getPublicKey = function() {
  return this._keypair.getPublicKey('hex','compressed');
};

/**
 * Returns the nodeID
 * #getNodeID
 */
KeyPair.prototype.getNodeID = function() {
  return utils.getNodeIdFromPublicKey(this.getPublicKey());
};

/**
 * Encrypt a message
 * #encrypt
 * @param {String|Buffer} pubkey
 * @param {Buffer} iv
 * @param {Buffer} plaintext
 */
KeyPair.prototype.encrypt = function(pubkey, iv, plaintext) {
  if (!Buffer.isBuffer(pubkey)) {
    pubkey = Buffer.from(pubkey, 'hex');
  }

  //compute secret
  const secret=this._keypair.computeSecret(pubkey)

  //encrypt
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, secret, iv)
  const updatetext = cipher.update(plaintext)
  const finaltext = cipher.final()
  const tag = cipher.getAuthTag()

  //put together the ciphertext buffer
  const myPubKey = Buffer.from(this.getPublicKey(),'hex');

  const ciphertext = Buffer.concat([myPubKey, tag, updatetext, finaltext])

  return ciphertext;
};

/**
 * Decrypt a message
 * #decrypt
 * @param {Buffer} iv
 * @param {Buffer} ciphertext
 */
KeyPair.prototype.decrypt = function(iv, ciphertext) {
  //split packet
  const pubkey = Buffer.from(ciphertext.slice(0,33))
  const tag = Buffer.from(ciphertext.slice(33,49))
  const text = Buffer.from(ciphertext.slice(49))

  //compute secret
  const secret = this._keypair.computeSecret(pubkey)

  //decrypt
  const cipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, secret, iv)
  cipher.setAuthTag(tag)
  const updatetext = cipher.update(text)
  const finaltext = cipher.final()

  //put together plaintext package
  var plaintext = Buffer.alloc(updatetext.length + finaltext.length)
  updatetext.copy(plaintext, 0)
  finaltext.copy(plaintext, updatetext.length)

  return plaintext;
};

module.exports = KeyPair;
