/* eslint-env node, mocha */

'use strict';

const raml2obj = require('..');
const assert = require('assert');
const fs = require('fs');
const omitDeep = require('omit-deep-lodash');

describe('raml2obj', () => {
  describe('*.raml (lite-canonicalizer)', () => {
    let results;
    // const testFile = 'types';
    // const testFile = 'crm-accounts';
    const testFile = 'synthetic';

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
      // liteCanonical allows itself to add more data in addition, these are ignored.
      const datatypeExpObj = omitDeep(
        results[0],
        'key',
        'superTypes',
        'subTypes'
      );
      const liteCanonicalObj = omitDeep(
        results[1],
        'key',
        'superTypes',
        'subTypes'
      );
      // Defined deviation: Remove nested properties from the specification.
      // They are not needed for documentation rendering and provide no actual RAML expressivity
      // compared to looking up the property type directly.  In other words: they are just recursive duplication
      // - types.$typeName.items.properties
      // - types.$typeName.properties.$propName.properties
      // - types.$typeName.properties.$propName.items.properties
      for (const typeKey in datatypeExpObj.types) {
        const type = datatypeExpObj.types[typeKey];
        if (type.items && type.items.properties) {
          delete type.items.properties;
        }
        if (type.properties) {
          for (const propKey in type.properties) {
            const prop = type.properties[propKey];
            delete prop.properties;
            if (prop.items && prop.items.properties) {
              delete prop.items.properties;
            }
          }
        }
      }

      // help debugging outside the assert output:
      fs.writeFileSync(
        `test/${testFile}.datatype-expansion.json`,
        JSON.stringify(datatypeExpObj.types, null, 2)
      );
      fs.writeFileSync(
        `test/${testFile}.lite-canonicalizer.json`,
        JSON.stringify(liteCanonicalObj.types, null, 2)
      );
      // Phase one scope is green if the types are OK:
      assert.deepStrictEqual(datatypeExpObj.types, liteCanonicalObj.types);
    });
  });
});
