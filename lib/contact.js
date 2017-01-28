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
   * Creates a spartacus contact
   * @constructor
   * @param {Object} options
   */
  function SpartacusContact(options) {
    if (!(this instanceof SpartacusContact)) {
      return new SpartacusContact(options);
    }

    this.pubkey = new Buffer(options.pubkey, 'hex');

    Contact.call(this, options);
  }

  inherits(SpartacusContact, Contact);

  /**
   * Generates a nodeID
   * #_createNodeID
   */
  SpartacusContact.prototype._createNodeID = function() {
    return utils.getNodeIdFromPublicKey(this.pubkey);
  };

  return SpartacusContact;
}

module.exports = ContactDecorator;
