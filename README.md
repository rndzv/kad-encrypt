Kad Spartacus
=============

[![Build Status](https://img.shields.io/travis/gordonwritescode/kad-spartacus.svg?style=flat-square)](https://travis-ci.org/gordonwritescode/kad-spartacus)
[![Coverage Status](https://img.shields.io/coveralls/gordonwritescode/kad-spartacus.svg?style=flat-square)](https://coveralls.io/r/gordonwritescode/kad-spartacus)
[![NPM](https://img.shields.io/npm/v/kad-spartacus.svg?style=flat-square)](https://www.npmjs.com/package/kad-spartacus)

Sybil and Spartacus attack mitigation extension for
[Kad](https://github.com/gordonwritescode/kad).

Usage
-----

Install with NPM.

```bash
npm install kad@1.2.0-beta kad-spartacus
```

Integrate with your Kad project.

```js
var kademlia = require('kad');
var spartacus = require('kad-spartacus');

// Import your private EC key or create a new key pair
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

About: Attacks
--------------

Kad Spartacus aims to mitigate 2 types of attacks to which a Kademlia DHT may
be vulnerable: the **Sybil** attack and it's variant **Spartacus**.

### Sybil Attack

Describes a network attack in which attackers select nodeIDs whose values
enable them to position themselves in the network in patterns optimal for
disrupting operations. For example, to remove a data item from the network,
attackers might cluster around its key, accept any attempts to store the
key/value pair, but never return the value when presented with the key.

### Spartacus Attack

A Sybil variation is the Spartacus attack, where an attacker joins the network
claiming to have the same nodeID as another member. As specified, Kademlia has
no defense. In particular, a long-lived node can always steal a short-lived
node's nodeID.

About: Defenses
---------------

A well-known defense is to require nodes to get their assigned `nodeID` from a
central server which is responsible for making sure that the distribution of
`nodeID`s are even.

A weaker solution is the requirement that `nodeID`s be derived from the node's
network address or similar.

Kad Spartacus takes a different approach to these problems. By introducing
cryptographic "identities" using ECDSA, nodes are required to "prove" that they
"own" their nodeID by signing messages with their private EC key and including
their public EC in the message. The `nodeID` is derived from the public key,
therefore any node's claimed `nodeID` can be verified by checking it against the
included public key and verifying the signature.

### Sybil Attack

The use of EC keys and signature verification eliminates the ability for nodes
to arbitrarily select a `nodeID`, instead they are required to generate a ECDSA
key pair. This greatly limits attackers and would require a significant
resource cost to attempt the "brute force" a nodeID by generating key pairs
randomly in order to arrive at one that is close to an arbitrary key.

### Spartacus Attack

Since the `nodeID` is the hex encoded RIPEMD160 hash of the SHA256 hash of the
ECDSA public key, we can ensure that nodes are not capable of claiming a
`nodeID` that does not belong to them. This is almost identical to how a
bitcoin address is created. In fact, the `nodeID` can be converted into a
bitcoin address by simply adding the network prefix and checksum, then encoding
as base58.
