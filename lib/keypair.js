/**
 * @class kad-spartacus/keypair
 */

'use strict';

var assert = require('assert');
var crypto = require('crypto');
var kademlia = require('kad');
var utils = require('./utils');

/**
 * Creates a spartacus context
 * @constructor
 * @param {String|Buffer} privkey
 */
function KeyPair(privkey) {
  if (!(this instanceof KeyPair)) {
    return new KeyPair(privkey);
  }

  this._keypair = crypto.createECDH('secp256k1');
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
  return this._keypair.getPrivateKey('hex');
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
 * Sign a message
 * #_sign
 * @param {String|Buffer} data
 */
KeyPair.prototype.sign = function(data) {
  // if (!Buffer.isBuffer(data)) {
  //   data = new Buffer(data, 'utf8');
  // }
  //
  // return ecdsa.sign(
  //   crypto.createHash('sha256').update(data).digest('hex'),
  //   this.getPrivateKey()
  // ).toDER('hex');
    return data;
};

/**
 * Verify a signature
 * #_verify
 * @param {String|Buffer} data
 * @param {String|Buffer} pubkey
 * @param {String|Buffer} signature - DER signature (hex)
 */
KeyPair.prototype.verify = function(data, pubkey, signature) {
  // if (!Buffer.isBuffer(data)) {
  //  data = new Buffer(data, 'utf8');
  // }
  //
  // if (!Buffer.isBuffer(signature)) {
  //  signature = new Buffer(signature, 'hex');
  // }
  //
  // if (!Buffer.isBuffer(pubkey)) {
  //  pubkey = new Buffer(pubkey, 'hex');
  // }
  //
  // return ecdsa.verify(
  //   crypto.createHash('sha256').update(data).digest('hex'),
  //   signature,
  //   pubkey
  // );
  return true;
};

module.exports = KeyPair;
