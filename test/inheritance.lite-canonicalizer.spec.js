/* eslint-env node, mocha */

'use strict';

const raml2obj = require('..');
const assert = require('assert');

describe('raml2obj', () => {
  describe('inheritance.raml (lite canonicalizer)', () => {
    let obj;

    before(done => {
      raml2obj.parse('test/inheritance.raml', {
        canonicalTypeImpl: 'lite-canonicalizer',
        collectionFormat: 'arrays',
      }).then(
        result => {
          obj = result;
          done();
        },
        error => {
          console.log('error', error);
        }
      );
    });

    it('should test the basic properties of the raml object', () => {
      assert.strictEqual(obj.title, 'Inheritance Test');
      assert.strictEqual(obj.resources.length, 1);
    });

    const getType = name => obj.types.find(t => t.name == name)
    const getProperty = (typeName, propName) => getType(typeName).properties.find(p => p.name == propName)

    it('should test type inheritance', () => {
      const passwordProtectedAccountInResource = obj.resources[0].methods[0].body[0];

      passwordProtectedAccountInResource.key = getType("PasswordProtectedAccount").key
      assert.deepStrictEqual(passwordProtectedAccountInResource, getType("PasswordProtectedAccount"))

      assert.strictEqual(getType("Account").properties.length, 3);
      assert.strictEqual(getType("PasswordProtectedAccount").properties.length, 4);
      assert.strictEqual(getType("BannableAccount").properties.length, 5);

      assert.strictEqual(getProperty("PasswordProtectedAccount", "password").displayName, 'password');
      assert.strictEqual(getProperty("PasswordProtectedAccount", "password").type, 'string');
      assert.strictEqual(getProperty("BannableAccount", "name").displayName, 'name');
    });

    it('should test description of descendants', () => {
      const methods = obj.resources[0].methods;

      assert.strictEqual(
        methods[0].body[0].description,
        'An account which is password protected.'
      );
      assert.strictEqual(
        // BannedAccount must have inherited the description
        methods[1].body[0].description,
        'An account which is password protected.'
      );
    });
  });
});
