'use strict';

var expect = require('chai').expect;
var kademlia = require('kad');
var CryptoContact = require('../lib/contact').CryptoContact;

describe('ContactDecorator', function() {

  describe('@factory', function() {

    it('should return an instanceof the passed Contact', function() {
      var Contact = CryptoContact;
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        pubkey: '028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5'
      })).to.be.instanceOf(CryptoContact);
    });

    it('should add the pubkey to the contact', function() {
      var Contact = CryptoContact;
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        pubkey: '028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5'
      }).pubkey).to.equal('028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5');
    });

    it('should use the supplied private key', function() {
      var Contact = CryptoContact;
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        privateKey: '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
      }).keypair.getPrivateKey()).to.equal('3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617');
    });

    it('should not enumerate keypair', function() {
      var Contact = CryptoContact;
      expect(JSON.stringify(Contact({
        address: '127.0.0.1',
        port: 1337,
        privateKey: '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
      })).indexOf('keypair')).to.equal(-1);
    });

    it('should use the correct nodeID', function() {
      var Contact = CryptoContact;
      expect(Contact({
        address: '127.0.0.1',
        port: 1337,
        pubkey: '028ac783dab2f134946ed5c6b85eadc48ce745721a01eb071d6faaadcdea7b32d5'
      }).nodeID).to.equal('7185386d2032f44b794ac5f9e9bd5914d7415498');
    });

  });

});
