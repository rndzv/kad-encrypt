'use strict';

var sinon = require('sinon');
var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var kademlia = require('kad');
var KeyPair = require('../lib/keypair');

describe('KeyPair', function() {

  describe('@constructor', function() {

    it('should create an instance with the new keyword', function() {
      expect(new KeyPair()).to.be.instanceOf(KeyPair);
    });

    it('should create an instance without the new keyword', function() {
      expect(KeyPair()).to.be.instanceOf(KeyPair);
    });

    it('should use the supplied key', function() {
      expect(
        KeyPair(
          '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
        )._keypair.getPrivateKey('hex')
      ).to.equal(
        '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
      );
    });

    it('should generate a new key pair', function() {
      var kp = KeyPair();
      expect(kp._keypair.getPrivateKey.bind(kp._keypair)).to.not.throw(Error);
    });

  });

  describe('#getPrivateKey', function() {

    it('should return the private key', function() {
      expect(
        KeyPair(
          '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
        ).getPrivateKey()
      ).to.equal(
        '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
      );
    });

  });

  describe('#getPublicKey', function() {

    it('should return the public key', function() {
      expect(
        KeyPair(
          '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
        ).getPublicKey()
      ).to.equal(
        '02f12738f0f25862f8ddaaae6820d071a7c774ace005e6e5605fbcc6e9a9eb5971'
      );
    });

  });

  describe('#getNodeID', function() {

    it('should return the node id', function() {
      expect(
        KeyPair(
          '3d9828d83318d5b1c8a92b50967bd956155d22197ae9d79ff7e4f0c3209db617'
        ).getNodeID()
      ).to.equal(
        '2a902b8de57560f0e35c4deaa7bcc4d77b9ae4d3'
      );
    });

  });

  describe('#encrypt/#decrypt', function() {

    var kp1 = KeyPair();
    var kp2 = KeyPair();

    it('should verify the valid signature as strings', function() {
      var contract = 'test string';
      var signature = kp1.sign(contract);
      expect(kp2.verify(contract, kp1.getPublicKey(), signature)).to.equal(true);
    });

    it('should reject the invalid signature', function() {
      var contract = 'test string';
      var signature = kp1.sign(contract);
      expect(kp2.verify(contract, kp2.getPublicKey(), signature)).to.equal(false);
    });

    it('should verify the valid signature as buffers', function() {
      var contract = new Buffer('test string', 'utf8');
      var signature = new Buffer(kp1.sign(contract), 'hex');
      expect(kp2.verify(
        contract,
        new Buffer(kp1.getPublicKey(), 'hex'),
        signature)
      ).to.equal(true);
    });

  });

});
