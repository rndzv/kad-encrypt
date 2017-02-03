Kad Encrypt
=============

Packet encryption for
[Kad](https://github.com/kadtools/kad). Currently only for UDP. Compatible with
[Kad Spartacus](https://github.com/kadtools/kad-spartacus). Currently node 6.x
only.

Usage
-----

Install with NPM.

```bash
npm install kad kad-encrypt
```

Integrate with your Kad project.

```js
var kad = require('kad');
var encrypt = require('kad-encrypt');

// Setup your Contact
var Contact = encrypt.ContactDecorator(
  kad.contacts.AddressPortContact
);

// Load up the transport from encrypt.
// if privateKey is not included a new identity will be created
var transport = encrypt.UDP(Contact({
  address: '127.0.0.1',
  port: 1337,
  privateKey: privateKey
}));

//If you'd like to also prevent Sybil/Spartacus attacks:
transport.before('send', encrypt.hooks.verify);
```

About: Verification / Attack Mitigation
--------------

Like [Kad Spartacus](https://github.com/kadtools/kad-spartacus), Kad Encrypt  
introduces cryptographic identities using EC. In this case, nodes prove they own
their nodeID by successfully decrypting messages with their private EC key and
including their public EC in the message. The `nodeID` is derived from the
public key, therefore any node's claimed `nodeID` can be verified by checking it
against the included public key.

Note that Spartacus imposes its requirement on /incoming/ messages,
while Encrypt does so with /outgoing/ messages. Either one should be sufficient,
since with Encrypt any node lying about their public key (and thus nodeID
ownership) will not be able to decrypt any response. Using Kad Spartacus
as well would provide additional security for incoming messages (the identities
are compatible).

About: Encryption
--------------
Outgoing messages are encrypted with a secret derived from an ephemeral EC
keypair (generated per-message) and the destination contact's public key. The
encryption is done with AES-256-GCM so that tampered messages can be rejected.
Messages also include a timestamp in the IV which may prevent replay attacks.
