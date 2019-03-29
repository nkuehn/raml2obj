/* eslint-env node, mocha */

'use strict';

const raml2obj = require('..');
const assert = require('assert');
const fs = require('fs');
const omitDeep = require('omit-deep-lodash');

describe('raml2obj', () => {
  describe('*.raml (lite-canonicalizer)', () => {
    // this.timeout(10000);
    let results;
    const testFile = 'types';
    // const testFile = 'crm-accounts';
    before(done => {
      Promise.all([
        raml2obj.parse(`test/${testFile}.raml`),
        raml2obj.parse(`test/${testFile}.raml`, {
          canonicalTypeImpl: 'lite-canonicalizer',
        }),
      ]).then(
        res => {
          results = res;
          done();
        },
        error => {
          console.log(error);
        }
      );
    });

    it('should be mostly equal', () => {
      fs.writeFileSync(
        `test/${testFile}.lite-canonicalizer.json`,
        JSON.stringify(results[1], null, 2)
      );
      fs.writeFileSync(
        `test/${testFile}.datatype-expansion.json`,
        JSON.stringify(results[0], null, 2)
      );
      // liteCanonical allows itself to add more data in addition, these are ignored.
      // ONLY testing they types for now, resources follow later:
      const datatypeExpObj = omitDeep(
        results[0].types,
        'key',
        'superTypes',
        'subTypes'
      );
      const liteCanonicalObj = omitDeep(
        results[1].types,
        'key',
        'superTypes',
        'subTypes'
      );
      assert.deepStrictEqual(datatypeExpObj, liteCanonicalObj);
    });
  });
});
