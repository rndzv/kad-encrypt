'use strict';

var expect = require('chai').expect;
var kademlia = require('kad');
var ContactDecorator = require('../lib/contact');

describe('ContactDecorator', function() {

  describe('@factory', function() {

    it('should return an instanceof the passed Contact', function() {
      var Contact = ContactDecorator(kademlia.contacts.AddressPortContact);
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        pubkey: '028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5'
      })).to.be.instanceOf(kademlia.contacts.AddressPortContact);
    });

    it('should add the pubkey to the contact', function() {
      var Contact = ContactDecorator(kademlia.contacts.AddressPortContact);
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        pubkey: '028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5'
      }).pubkey).to.be.instanceOf(Buffer);
    });

    it('should use the correct nodeID', function() {
      var Contact = ContactDecorator(kademlia.contacts.AddressPortContact);
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        pubkey: '028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5'
      }).nodeID).to.equal('7185386d2032f44b794ac5f9e9bd5914d7415498');
    });

  });

});
