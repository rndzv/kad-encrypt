Kad Spartacus
=============

[![Build Status](https://img.shields.io/travis/gordonwritescode/kad-spartacus.svg?style=flat-square)](https://travis-ci.org/gordonwritescode/kad-spartacus)

Sybil and Spartacus attack mitigation extension for
[Kad](https://github.com/gordonwritescode/kad).

Usage
-----

```bash
npm install kad@1.2.0-beta kad-spartacus
```

```js
var kademlia = require('kad');
var spartacus = require('kad-spartacus');

// Create a Spartacus key pair
var keypair = new spartacus.KeyPair(privkey);

// Setup your Contact for Spartacus
var Contact = spartacus.ContactDecorator(kademlia.contacts.AddressPortContact);

// Create your transport with a SpartacusContact
var transport = kademlia.transports.UDP(Contact({
  address: '127.0.0.1',
  port: 1337,
  pubkey: keypair.getPublicKey()
}));

// Sign your messages
transport.before('serialize', spartacus.hooks.sign(keypair));

// Verify received messages
transport.before('receive', spartacus.hooks.verify(keypair));
```

About
-----
