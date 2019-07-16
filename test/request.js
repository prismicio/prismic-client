const path = require('path');
const nock = require('nock');
const chai = require('chai');

const assert = chai.assert;
const Prismic = require(path.join(__dirname, '../', 'dist', 'prismic-javascript.min.js'));

const STUB_RESPONSE = {
  refs: [],
  experiments: {},
  bookmarks: {},
  tags: {},
  types: {},
};

describe('request', () => {
  beforeEach(() => {
    nock(/example\.prismic\.io/)
     .get('/api/v2')
     .reply(200, STUB_RESPONSE);
   });

   it('Makes a request and handels a json response', (done) => {
     Prismic.getApi('https://example.prismic.io/api/v2')
      .then((json) => {
        assert.deepEqual(json.data, STUB_RESPONSE);
        done();
      }).catch(done);
   });
});
