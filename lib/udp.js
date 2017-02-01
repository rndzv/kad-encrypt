'use strict';

var kad = require('kad');
var inherits = require('util').inherits;
var assert = require('assert');
var dgram = require('dgram');
var kad = require('kad')
var RPC = kad.RPC;
var hooks = require('./hooks')
const KeyPair = require('./keypair')
var {CryptoContact} = require('./contact')

/**
 * Transport adapter that sends and receives message over UDP
 * @constructor
 * @extends {RPC}
 * @param {Contact} contact - Your node's {@link Contact} instance
 */
function EncryptedUDPTransport(contact, options) {
  if (!(this instanceof EncryptedUDPTransport)) {
    return new EncryptedUDPTransport(contact, options);
  }

  assert(contact instanceof CryptoContact, 'Invalid contact supplied');
  assert(contact.keypair instanceof KeyPair, 'Invalid keypair supplied');

  this._encrypt = hooks.encrypt()
  this._decrypt = hooks.decrypt(contact.keypair)

  RPC.call(this, contact, options);
}

inherits(EncryptedUDPTransport, RPC);

EncryptedUDPTransport.MAX_MESSAGE_SIZE = 512; // bytes

/**
 * Create a UDP socket
 * @private
 * @param {function} done
 */
EncryptedUDPTransport.prototype._open = function(done) {
  var self = this;

  function createSocket(port) {
    self._socket = dgram.createSocket(
      { type: 'udp4', reuseAddr: false },
      self._receive.bind(self)
    );

    self._socket.on('listening', done);

    self._socket.on('error', function(err) {
      self.emit('error', err);
    });

    self._socket.bind(port);
  }

  createSocket(self._contact.port);
};

/**
 * Send a RPC to the given contact (encode with msgpack before sending)
 * @private
 * @param {Buffer} data
 * @param {Contact} contact
 */
EncryptedUDPTransport.prototype._send = function(data, contact) {
  var self = this;

  data = this._encrypt(data,contact,function(err) {
    if (err) self.emit('error', err);
  })
  if (data instanceof Error) return;

  if (data.length > EncryptedUDPTransport.MAX_MESSAGE_SIZE) {
    this._log.warn(
      'outbound message greater than %sb (%sb) and risks fragmentation',
      EncryptedUDPTransport.MAX_MESSAGE_SIZE,
      data.length
    );
  }
  
  this._socket.send(data, 0, data.length, contact.port, contact.address);
};

/**
 * Receive RPC
 * @private
 * @param {Buffer} data
 */
EncryptedUDPTransport.prototype._receive = function(data) {
  var self = this;

  data = this._decrypt(data,function(err) {
    if (err) self.emit('error', err);
  })
  if (data instanceof Error) return;kad

  this.receive(data);
};

/**
 * Close the underlying socket
 * @private
 */
EncryptedUDPTransport.prototype._close = function() {
  this._socket.close();
};

module.exports = EncryptedUDPTransport;
