/**
 * @module kad-encrypt/contact-decorator
 */

'use strict';

var assert = require('assert');
var kademlia = require('kad');
var inherits = require('util').inherits;
var utils = require('./utils');

function ContactDecorator(Contact) {
  /**
   * Creates a contact with pubkey
   * @constructor
   * @param {Object} options
   */
  function CryptoContact(options) {
    if (!(this instanceof CryptoContact)) {
      return new CryptoContact(options);
    }

    this.pubkey = new Buffer(options.pubkey, 'hex');

    Contact.call(this, options);
  }

  inherits(CryptoContact, Contact);

  /**
   * Generates a nodeID
   * #_createNodeID
   */
  CryptoContact.prototype._createNodeID = function() {
    return utils.getNodeIdFromPublicKey(this.pubkey);
  };

  return CryptoContact;
}

module.exports = ContactDecorator;
