'use strict';

var expect = require('chai').expect;
var utils = require('../lib/utils');

describe('Utils', function() {

  describe('#getNodeIdFromPublicKey', function() {

    it('should take the hex pubkey and return the hex nodeID', function() {
      expect(utils.getNodeIdFromPublicKey(
        '03d18b9d2e81b92839bcf404baca854b9a95e034cd98072563d10653bc6d1a3888'
      )).to.equal('3a5557aff9b8e37f1d85bdf3b80f90bf64a14eb8');
    });

    it('should take the pubkey buffer and return the hex nodeID', function() {
      expect(utils.getNodeIdFromPublicKey(new Buffer(
        '03d18b9d2e81b92839bcf404baca854b9a95e034cd98072563d10653bc6d1a3888',
        'hex'
      ))).to.equal('3a5557aff9b8e37f1d85bdf3b80f90bf64a14eb8');
    });

    it('should return error on invalid key', function() {
      const result=utils.getNodeIdFromPublicKey('not a valid key')
      expect(result).to.be.instanceof(Error);
    });

  });

});
