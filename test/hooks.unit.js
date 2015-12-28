'use strict';

var sinon = require('sinon');
var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var kademlia = require('kad');
var KeyPair = require('../lib/keypair');
var ContactDecorator = require('../lib/contact');
var hooks = require('../lib/hooks');

describe('Hooks', function() {

  var SpartacusContact = ContactDecorator(kademlia.contacts.AddressPortContact);

  var keypair1 = KeyPair();
  var contact1 = SpartacusContact({
    address: '127.0.0.1',
    port: 1337,
    pubkey: keypair1.getPublicKey()
  });

  var keypair2 = KeyPair();
  var contact2 = SpartacusContact({
    address: '127.0.0.1',
    port: 1338,
    pubkey: keypair2.getPublicKey()
  });

  describe('#sign', function() {

    it('should sign the message id and nonce for the request', function(done) {
      var sign = hooks.sign(keypair1);
      var msg = kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact1
        }
      });
      sign(msg, contact2, function() {
        expect(typeof msg.params.__signature).to.equal('string');
        expect(typeof msg.params.__nonce).to.equal('number');
        done();
      });
    });

    it('should sign the message id and nonce for the response', function(done) {
      var sign = hooks.sign(keypair1);
      var msg = kademlia.Message({
        result: {
          contact: contact1
        },
        id: kademlia.utils.createID('message')
      });
      sign(msg, contact2, function() {
        expect(typeof msg.result.__signature).to.equal('string');
        expect(typeof msg.result.__nonce).to.equal('number');
        done();
      });
    });

  });

  describe('#verify', function() {

    it('should verify request signature', function(done) {
      var sign = hooks.sign(keypair1);
      var verify = hooks.verify(keypair2);
      var msg = kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact1
        }
      });
      sign(msg, contact2, function() {
        verify(msg, contact1, done);
      });
    });

    it('should verify the response signature', function(done) {
      var sign = hooks.sign(keypair2);
      var verify = hooks.verify(keypair1);
      var msg = kademlia.Message({
        result: {
          contact: contact1
        },
        id: kademlia.utils.createID('test')
      });
      sign(msg, contact1, function() {
        verify(msg, contact2, done);
      });
    });

    it('should reject request signature', function(done) {
      var sign = hooks.sign(keypair1);
      var verify = hooks.verify(keypair2);
      var msg = kademlia.Message({
        method: 'TEST',
        params: {
          contact: contact1
        }
      });
      sign(msg, contact2, function() {
        verify(msg, contact2, function(err) {
          expect(err).to.be.instanceOf(Error);
          done();
        });
      });
    });

    it('should reject the response signature', function(done) {
      var sign = hooks.sign(keypair2);
      var verify = hooks.verify(keypair1);
      var msg = kademlia.Message({
        result: {
          contact: contact2
        },
        id: kademlia.utils.createID('test')
      });
      sign(msg, contact1, function() {
        verify(msg, contact1, function(err) {
          expect(err).to.be.instanceOf(Error);
          done();
        });
      });
    });

  });

});
