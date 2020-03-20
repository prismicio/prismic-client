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

  it('Makes a request and handels a json response', (done) => {

    nock(/example\.prismic\.io/)
    .get('/api/v2')
    .reply(200, STUB_RESPONSE);

    Prismic.getApi('https://example.prismic.io/api/v2')
      .then((json) => {
        assert.deepEqual(json.data, STUB_RESPONSE);
        done();
      }).catch(done);
  });

  it('Supports response timeout parameter', (done) => {

    nock(/example\.prismic\.io/)
    .get('/api/v2')
    .reply((uri, requestBody, cb) => {
      setTimeout(() => cb(null, [200, STUB_RESPONSE]), 50)
    })

    Prismic.getApi('https://example.prismic.io/api/v2', { timeoutInMs: 10 })
    .catch(err => {
      assert.equal(err.toString(), 'Error: https://example.prismic.io/api/v2 response timeout')
      done()
    })
  });
});
