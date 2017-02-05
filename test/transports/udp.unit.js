'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var RPC = require('../../lib/transports/udp');
var kad = require('kad')
var Message = kad.Message;
var KeyPair = require('../../lib/keypair');
var hooks = require('../../lib/hooks')

var CryptoContact = require('../../lib/contact').CryptoContact

function getPortContact(port) {
  var keypair = new KeyPair()
  return new CryptoContact({ address: '0.0.0.0', port: port, keypair:keypair })
}

describe('Transports/UDP', function() {

  describe('@constructor', function() {

    it('should create an instance with the `new` keyword', function() {
      var contact = getPortContact(0);
      var rpc = new RPC(contact);
      expect(rpc).to.be.instanceOf(RPC);
    });

    it('should create an instance without the `new` keyword', function() {
      var contact = getPortContact(0);
      var rpc = RPC(contact);
      expect(rpc).to.be.instanceOf(RPC);
    });

    it('should bind to the given port (or random port)', function(done) {
      var contact = getPortContact(0);
      var rpc = RPC(contact);
      rpc.on('ready', function() {
        expect(typeof rpc._socket.address().port).to.equal('number');
        done();
      });
    });

  });


  describe('#_createContact', function() {
    it('should create an CryptoContact', function() {
      var rpc = new RPC(getPortContact(1));
      var keypair = new KeyPair();
      var contact = rpc._createContact({ address: '0.0.0.0', port: 0, keypair:keypair });
      expect(contact).to.be.instanceOf(CryptoContact);
    });
  });

  describe('#send', function() {

    var contact1 = getPortContact(0);
    var contact2 = getPortContact(0);
    var rpc1;
    var rpc2;

    before(function(done) {
      var count = 0;
      function ready() {
        if (count === 2) {
          done();
        }
      }
      function inc() {
        count++;
        ready();
      }
      rpc1 = new RPC(contact1);
      rpc2 = new RPC(contact2);
      rpc1.on('ready', inc);
      rpc2.on('ready', inc);
    });

    after(function() {
      rpc1.close();
      rpc2.close();
    });

    it('should throw with invalid message', function() {
      var contact = getPortContact(1234);
      expect(function() {
        rpc1.send(contact, {});
      }).to.throw(Error, 'Invalid message supplied');
    });

    it('should send a message and create a response handler', function() {
      var addr1 = rpc1._socket.address();
      var addr2 = rpc2._socket.address();
      var contactRpc1 = getPortContact(addr1.port);
      var contactRpc2 = getPortContact(addr2.port);
      var msg = new Message({
        method: 'PING',
        params: { contact: contactRpc1 },
      });
      var handler = sinon.stub();
      rpc1.send(contactRpc2, msg, handler);
      var calls = Object.keys(rpc1._pendingCalls);
      expect(calls).to.have.lengthOf(1);
      expect(rpc1._pendingCalls[calls[0]].callback).to.equal(handler);
    });

    it('should send a message and forget it', function() {
      var addr1 = rpc1._socket.address();
      var addr2 = rpc2._socket.address();
      var contactRpc1 = getPortContact(addr1.port);
      var contactRpc2 = getPortContact(addr2.port);
      var msg = new Message({
        method: 'PING',
        params: { contact: contactRpc2 },
      });
      rpc2.send(contactRpc1, msg);
      var calls = Object.keys(rpc2._pendingCalls);
      expect(calls).to.have.lengthOf(0);
    });

  });

  describe('#close', function() {

    it('should close the underlying socket', function(done) {
      var contact = getPortContact(0);
      var rpc = new RPC(contact);
      rpc.on('ready', function() {
        expect(rpc._socket._receiving).to.equal(true);
        rpc.close();
        expect(rpc._socket._receiving).to.equal(false);
        done();
      });
    });

  });


  describe('#receive', function() {

    var contact1 = getPortContact(1234);
    var contact2 = getPortContact(0);
    var validMsg1 = Message({
      method: 'PING',
      params: { contact: contact1 },
    }).serialize();
    validMsg1.id = 10;
    var validMsg2 = Message({
      id: 10,
      result: { contact: contact1 },
    }).serialize();
    var invalidMsg = Buffer(JSON.stringify({ type: 'WRONG', params: {} }));
    var invalidJSON = Buffer('i am a bad message');
    var rpc = new RPC(contact2);

    it('should drop the message if invalid JSON', function(done) {
      rpc.once('MESSAGE_DROP', function() {
        done();
      });
      rpc.receive(invalidJSON, {});
    });

    it('should drop the message if invalid message type', function(done) {
      rpc.once('MESSAGE_DROP', function() {
        done();
      });
      rpc.receive(invalidMsg, {});
    });

    it('should emit the message type if not a reply', function(done) {
      rpc.once('PING', function(data) {
        expect(typeof data).to.equal('object');
        done();
      });
      rpc.receive(validMsg1, { address: '127.0.0.1', port: 1234 });
    });

    it('should call the message callback if a reply', function(done) {
      rpc._pendingCalls[10] = {
        callback: function(err, msg) {
          expect(err).to.equal(null);
          expect(msg.id).to.equal(10);
          done();
        }
      };
      rpc.receive(validMsg2, { address: '127.0.0.1', port: 1234 });
    });

  });

  describe('#_expireCalls', function() {

    it('should call expired handler with error and remove it', function() {
      var contact = getPortContact(0);
      var rpc = new RPC(contact);
      var freshHandler = sinon.stub();
      var staleHandler = sinon.spy();
      rpc._pendingCalls.rpc_id_1 = {
        timestamp: new Date('1970-1-1'),
        callback: staleHandler
      };
      rpc._pendingCalls.rpc_id_2 = {
        timestamp: new Date('3070-1-1'),
        callback: freshHandler
      };
      rpc._expireCalls();
      expect(Object.keys(rpc._pendingCalls)).to.have.lengthOf(1);
      expect(freshHandler.callCount).to.equal(0);
      expect(staleHandler.callCount).to.equal(1);
      expect(staleHandler.getCall(0).args[0]).to.be.instanceOf(Error);
    });

  });

  describe('#_open', function() {

    it('should emit an error if failed to bind to ip or port', function(done) {
      var keypair = new KeyPair();
      var contact = new CryptoContact({
        address: 'some.host',
        port: 0,
        keypair: keypair
      });
      var rpc = new RPC(contact);
      rpc.on('error', function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.not.equal(undefined);
        done();
      });
      rpc._socket.emit('error', new Error('Failed to do something'));
    });

  });

  describe('#_send', function() {

    it('should warn if message size exceeds max', function() {
      var contact = getPortContact(0);
      var rpc = new RPC(contact);
      var _warn = sinon.stub(rpc._log, 'warn');
      var _send = sinon.stub(rpc._socket, 'send');
      var data = Buffer(513);
      data.fill(1);
      var otherContact = CryptoContact({ address: '127.0.0.1', port: 1337 })
      rpc._send(data, otherContact);
      _warn.restore();
      _send.restore();
      expect(_warn.called).to.equal(true);
      expect(_send.called).to.equal(true);
    });

  });

  describe('#_receive', function() {

    it('should error if time invalid', function(done) {
      var contact = getPortContact(0);
      var rpc = new RPC(contact);
      rpc.on('error', function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.not.equal(undefined);
        done();
      });
      var data = Buffer.alloc(256,55);
      rpc._receive(data);
    });

    it('should error if packet invalid', function(done) {
      var contact = getPortContact(0);
      var rpc = new RPC(contact);
      rpc.on('error', function(err) {
        expect(err).to.not.equal(null);
        expect(err).to.not.equal(undefined);
        done();
      });
      var data = Buffer.alloc(256,55);
      data.writeUInt32BE(Math.round(Date.now()/1000),0)
      rpc._receive(data);
    });

    it('should call receive if packet valid', function() {
      var contact = getPortContact(0);
      var encrypt = hooks.encrypt()
      var rpc = new RPC(contact);
      var _receive = sinon.stub(rpc, 'receive');
      var plaintext = Buffer.from('message we want to encrypt')
      var data = encrypt(plaintext,contact, () => {});
      rpc._receive(data);
      _receive.restore();
      expect(_receive.called).to.equal(true);
    });

  });

});
