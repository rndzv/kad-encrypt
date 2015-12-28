/**
 * @class kad-spartacus/keypair
 */

'use strict';

var assert = require('assert');
var crypto = require('crypto');
var elliptic = require('elliptic');
var kademlia = require('kad');
var ecdsa = new elliptic.ec(elliptic.curves.secp256k1);
var utils = require('./utils');

/**
 * Creates a spartacus context
 * @constructor
 * @param {String|Buffer} privkey
 */
function SpartacusKeyPair(privkey) {
  if (!(this instanceof SpartacusKeyPair)) {
    return new SpartacusKeyPair(privkey);
  }

  if (privkey) {
    this._keypair = ecdsa.keyFromPrivate(privkey);
  } else {
    this._keypair = ecdsa.genKeyPair();
  }
}

/**
 * Returns the private key
 * #getPrivateKey
 */
SpartacusKeyPair.prototype.getPrivateKey = function() {
  return this._keypair.getPrivate().toString('hex');
};

/**
 * Returns the public key
 * #getPublicKey
 */
SpartacusKeyPair.prototype.getPublicKey = function() {
  var pubkey, pubkeyobj = this._keypair.getPublic();
  var xbuf = new Buffer(pubkeyobj.x.toString('hex'), 'hex');
  var ybuf = new Buffer(pubkeyobj.y.toString('hex'), 'hex');

  if (ybuf[ybuf.length - 1] % 2) {
    pubkey = Buffer.concat([new Buffer([3]), xbuf]);
  } else {
    pubkey = Buffer.concat([new Buffer([2]), xbuf]);
  }

  return pubkey.toString('hex');
};

/**
 * Returns the nodeID
 * #getNodeID
 */
SpartacusKeyPair.prototype.getNodeID = function() {
  return utils.getNodeIdFromPublicKey(this.getPublicKey());
};

/**
 * Sign a message
 * #_sign
 * @param {String|Buffer} data
 */
SpartacusKeyPair.prototype._sign = function(data) {
  var buffer;

  if (!Buffer.isBuffer(data)) {
    buffer = new Buffer(data, 'utf8');
  } else {
    buffer = data;
  }

  return ecdsa.sign(
    crypto.createHash('sha256').update(buffer).digest('hex'),
    this.getPrivateKey()
  ).toDER('hex');
};

/**
 * Verify a signature
 * #_verify
 * @param {String|Buffer} data
 * @param {String} pubkey
 * @param {String|Buffer} hexsignature - DER signature (hex)
 */
SpartacusKeyPair.prototype._verify = function(data, pubkey, hexsignature) {
  var buffer, signature;

  if (!Buffer.isBuffer(data)) {
   buffer = new Buffer(data, 'utf8');
  } else {
   buffer = data;
  }

  if (!Buffer.isBuffer(hexsignature)) {
   signature = new Buffer(hexsignature, 'hex');
  } else {
   signature = hexsignature;
  }

  return ecdsa.verify(
    crypto.createHash('sha256').update(buffer).digest('hex'),
    signature,
    pubkey
  );
};

module.exports = SpartacusKeyPair;
