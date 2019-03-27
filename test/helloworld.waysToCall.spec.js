/* eslint-env node, mocha */

'use strict';

const raml2obj = require('..');
const assert = require('assert');
const ramlParser = require('raml-1-parser');

describe('raml2obj', () => {
  describe('helloworld.raml', () => {
    let byFileName;
    let byParserApi;
    let byRamlObj;

    before(done => {
      raml2obj.parse('test/helloworld.raml').then(
        result => {
          byFileName = result;
          done();
        },
        error => {
          console.log('error', error);
        }
      );
    });

    before(done => {
      const parsedApi = ramlParser.loadApiSync('test/helloworld.raml');
      raml2obj.parse(parsedApi).then(
        result => {
          byParserApi = result;
          done();
        },
        error => {
          console.log('error', error);
        }
      );
    });

    before(done => {
      const ramlObj = ramlParser.loadApiSync('test/helloworld.raml').toJSON();
      raml2obj.parse(ramlObj).then(
        result => {
          byRamlObj = result;
          done();
        },
        error => {
          console.log('error', error);
        }
      );
    });

    it('should test the basic properties of the raml object', () => {
      assert.strictEqual(byFileName.title, 'Hello world');
      assert.strictEqual(byParserApi.title, 'Hello world');
      assert.strictEqual(byRamlObj.title, 'Hello world');
    });
  });
});
