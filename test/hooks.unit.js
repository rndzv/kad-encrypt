'use strict';

var sinon = require('sinon');
var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var kademlia = require('kad');
var KeyPair = require('../lib/keypair');
var {CryptoContact} = require('../lib/contact');
var hooks = require('../lib/hooks');

describe('Hooks', function() {

  var keypair1 = KeyPair();
  var contact1 = CryptoContact({
    address: '127.0.0.1',
    port: 1337,
    pubkey: keypair1.getPublicKey(),
    nodeID: keypair1.getNodeID()
  });

  var keypair2 = KeyPair();
  var contact2 = CryptoContact({
    address: '127.0.0.1',
    port: 1338,
    pubkey: keypair2.getPublicKey(),
    nodeID: keypair2.getNodeID()
  });

  describe('#verify', function() {

    it('should accept a valid contact', function(done) {
      const plaintext = Buffer.from('abcd');
      hooks.verify(plaintext, contact1, function(err) {
        expect(err).to.be.undefined;
        done()
      });
    });

    it('should throw an error on invalid pubkey', function(done) {
      var badContact = CryptoContact({
        address: '127.0.0.1',
        port: 1338,
        pubkey: 'whaaaaat',
        nodeID: keypair1.getNodeID()
      });
      const plaintext = Buffer.from('abcd');
      hooks.verify(plaintext, badContact, function(err) {
        expect(err).to.be.instanceOf(Error);
        done()
      });
    });

  });

  describe('#encrypt', function() {

    it('should encrypt a valid message', function(done) {
      var encrypt = hooks.encrypt(keypair1);
      const plaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact2
        }
      })));
      const ciphertext = encrypt(plaintext, contact2, function(err) {
        expect(err).to.be.undefined;
      });
      expect(ciphertext.length > plaintext.length).to.be.true
      done();
    });

    it('should encrypt a valid message with no keypair', function(done) {
      var encrypt = hooks.encrypt();
      const plaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact2
        }
      })));
      const ciphertext = encrypt(plaintext, contact2, function(err) {
        expect(err).to.be.undefined;
      });
      expect(ciphertext.length > plaintext.length).to.be.true
      done();
    });

    it('should throw an error on invalid pubkey', function(done) {
      var encrypt = hooks.encrypt(keypair1);
      var badContact = CryptoContact({
        address: '127.0.0.1',
        port: 1338,
        pubkey: 'whaaaaat',
        nodeID: keypair1.getNodeID()
      });
      const plaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: badContact
        }
      })));
      const ciphertext = encrypt(plaintext, badContact, function(err) {
        return err;
      });
      expect(ciphertext).to.be.instanceOf(Error);

      done();
    });

  });

  describe('#decrypt', function() {

    it('should decrypt data from a specific key', function(done) {
      var encrypt = hooks.encrypt(keypair1);
      var decrypt = hooks.decrypt(keypair2);
      const originalPlaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact2
        }
      })));
      const ciphertext = encrypt(originalPlaintext, contact2, function(err) {
        expect(err).to.be.undefined;
      });
      const newPlaintext = decrypt(ciphertext, function(err) {
        expect(err).to.be.undefined;
      })
      expect(newPlaintext.toString('hex')).to.equal(originalPlaintext.toString('hex'))
      done();
    });

    it('should decrypt data from an ephemeral key', function(done) {
      var encrypt = hooks.encrypt();
      var decrypt = hooks.decrypt(keypair2);
      const originalPlaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact2
        }
      })));
      const ciphertext = encrypt(originalPlaintext, contact2, function(err) {
        expect(err).to.be.undefined;
      });
      const newPlaintext = decrypt(ciphertext, function(err) {
        expect(err).to.be.undefined;
      })
      expect(newPlaintext.toString('hex')).to.equal(originalPlaintext.toString('hex'))
      done();
    });

    it('should reject the expired date', function(done) {
      hooks.NONCE_EXPIRE = -10000;
      var encrypt = hooks.encrypt(keypair1);
      var decrypt = hooks.decrypt(keypair2);
      const originalPlaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact2
        }
      })));
      const ciphertext = encrypt(originalPlaintext, contact2, function(err) {
        expect(err).to.be.undefined;
      });
      const newPlaintext = decrypt(ciphertext, function(err) {
        return err;
      })
      expect(newPlaintext).to.be.instanceOf(Error);
      hooks.NONCE_EXPIRE = 10000;
      done();
    });


    it('should reject tampered data', function(done) {
      var encrypt = hooks.encrypt(keypair1);
      var decrypt = hooks.decrypt(keypair2);
      const originalPlaintext = Buffer.from(JSON.stringify(kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact2
        }
      })));
      var ciphertext = encrypt(originalPlaintext, contact2, function(err) {
        return err
      });
      Buffer.from('data corruption').copy(ciphertext,64)

      const newPlaintext = decrypt(ciphertext, function(err) {
        return err;
      })
      expect(newPlaintext).to.be.instanceOf(Error);
      done();
    });

  });

});
