'use strict';

var sinon = require('sinon');
var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var kademlia = require('kad');
var KeyPair = require('../lib/keypair');
var crypto = require('crypto');

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

    var kp1 = KeyPair('e8ce9b86f969c75e78ff333048a588b80783a8fc8c88f77dc62354af252df07e');
    var kp2 = KeyPair('eb1ccbc91478dac017912177d50c906d3c54812870151042746b3b6c60e0de4b');

    const iv = Buffer.from('6f590b5da844035a88cf116cb020114e','hex');
    const message = Buffer.from('the rain in spain falls mainly in the plain','ascii');
    const ciphertext = Buffer.from('030e115eb334fb6bd081e2e860ed6189f1b67fffd0fd8ff18e5d98e5ad3b5f04cdfd314ccf8933e2293a064628c4b59fbca028a3049123bbe0205ff6523a4653bb4f33700de4fa4899f716c59bd95029cf1e946a966c7738a11444db','hex')

    it('should encrypt a buffer with hex pubkey', function() {
      expect(kp1.encrypt(kp2.getPublicKey(), iv, message).toString('hex')).to.equal(ciphertext.toString('hex'));
    });

    it('should encrypt a buffer with buffer pubkey', function() {
      const pubkey = Buffer.from(kp2.getPublicKey(),'hex')
      expect(kp1.encrypt(pubkey, iv, message).toString('hex')).to.equal(ciphertext.toString('hex'));
    });

    it('should decrypt the buffer', function() {
      expect(kp2.decrypt(iv, ciphertext).toString('hex')).to.equal(message.toString('hex'));
    });

  });

});
