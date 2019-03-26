/* eslint-env node, mocha */

'use strict';

const raml2obj = require('..');
const assert = require('assert');
const fs = require('fs')

describe('raml2obj', () => {
  describe('crm-accounts.raml (lite-canonicalizer)', () => {
    // this.timeout(10000);
    let results;
    before(done => {

      Promise.all([
        raml2obj.parse('test/crm-accounts.raml'),
        raml2obj.parse('test/crm-accounts.raml', {
          canonicalTypeImpl: 'lite-canonicalizer'
        })
      ]).then(res => {
        results = res
        done()
      },
        error => {
          console.log(error);
        })
    });

    it('should be mostly equal', () => {
      fs.writeFileSync('test/crm-accounts.lite-canonicalizer.json', JSON.stringify(results[1], null, 2))
      fs.writeFileSync('test/crm-accounts.datatype-expansion.json', JSON.stringify(results[0], null, 2))
      assert.deepStrictEqual(results[0], results[1])
    });

  });
});
