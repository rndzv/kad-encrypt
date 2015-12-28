/**
 * @module kad-spartacus/contact-decorator
 */

'use strict';

var inherits = require('util').inherits;
var utils = require('./utils');

function ContactDecorator(Contact) {
  /**
   * Creates a spartacus contact
   * @constructor
   * @param {Object} options
   */
  function SpartacusContact(options) {
    this.pubkey = options.pubkey;

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
