/**
 * @module kad-encrypt/contact-decorator
 */

'use strict';

var assert = require('assert');
var inherits = require('util').inherits;
var utils = require('./utils');
const KeyPair = require('./keypair')
var AddressPortContact = require('kad').contacts.AddressPortContact

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

    if (options.pubkey) {
      this.pubkey = options.pubkey;
    } else {
      this.keypair = new KeyPair(options.privateKey);
      this.pubkey = this.keypair.getPublicKey();
    }


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

var CryptoContact = ContactDecorator(AddressPortContact)

module.exports.CryptoContact = CryptoContact;
module.exports.ContactDecorator = ContactDecorator;
