const path = require('path');
const nock = require('nock');
const chai = require('chai');

const assert = chai.assert;
const Prismic = require(path.join(__dirname, '../', 'cjs', '@prismicio/client.js'));

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

  it("retries after `retry-after` milliseconds if response code is 429", async () => {
    const retryAfter = 200; // ms
    /**
     * The number of milliseconds that time-measuring tests can vary.
     */
    const testTolerance = 100;
    /**
     * The number of times 429 is returned.
     */
    const retryResponseQty = 2;

    const endpoint = "https://example2.prismic.io/api/v2"

    const okResponse = { refs: [], ok: true };

    let responseTries = 0;

    // Override the query endpoint to return a 429 while `responseTries` is
    // less than or equal to `retryResponseQty`
    const apiMock = nock(/example2\.prismic\.io/)
    .get('/api/v2')
    .reply((uri, requestBody, cb) => {
      responseTries++;

      if (responseTries <= retryResponseQty) {
        cb(
          null,
          [
            429,
            {
              status_code: 429,
              status_message:
                "Your request count (11) is over the allowed limit of 10.",
            },
            {
              "retry-after": retryAfter.toString()
            }
          ]
        )
      } else {
        cb(null, [200, okResponse])
      }
    }).persist(true)

    // Rate limited. Should resolve roughly after retryAfter * retryResponseQty milliseconds.
    const t0_0 = Date.now()
    const res0 = await Prismic.getApi(endpoint)
    const t0_1 = Date.now()

    assert.deepEqual(res0.data, okResponse)
    assert.isTrue(t0_1 - t0_0 >= retryAfter * retryResponseQty)
    assert.isTrue(t0_1 - t0_0 <= retryAfter * retryResponseQty + testTolerance)
  
    // Not rate limited. Should resolve nearly immediately.
    const t1_0 = Date.now()
    const res1 = await Prismic.getApi(endpoint)
    const t1_1 = Date.now()
  
    assert.deepEqual(res1.data, okResponse)
    assert.isTrue(t1_1 - t1_0 >= 0)
    assert.isTrue(t1_1 - t1_0 <= testTolerance)

    apiMock.restore && apiMock.restore()
  });
  
  it("retries after 1000 milliseconds if response code is 429 and an invalid `retry-after` value is returned", async () => {
    /**
     * The number of milliseconds that time-measuring tests can vary.
     */
    const testTolerance = 100;
  
    const endpoint = "https://example3.prismic.io/api/v2"

    const okResponse = { refs: [], ok: true };

    let responseTries = 0;

    // Override the query endpoint to return a 429 while `responseTries` is
    // less than or equal to `retryResponseQty`
    const apiMock = nock(/example3\.prismic\.io/)
    .get('/api/v2')
    .reply((uri, requestBody, cb) => {
      responseTries++;

      if (responseTries <= 1) {
        cb(
          null,
          [
            429,
            {
              status_code: 429,
              status_message:
                "Your request count (11) is over the allowed limit of 10.",
            },
            {
              "retry-after": "invalid"
            }
          ]
        )
      } else {
        cb(null, [200, okResponse])
      }
    }).persist(true)
  
    // Rate limited. Should resolve roughly after 1000 milliseconds.
    const t0 = Date.now()
    const res = await Prismic.getApi(endpoint)
    const t1 = Date.now()
  
    assert.deepEqual(res.data, okResponse)
    assert.isTrue(t1 - t0 >= 1000)
    assert.isTrue(t1 - t0 <= 1000 + testTolerance)

    apiMock.restore && apiMock.restore()
  });
  
  it("throws if a non-2xx response is returned even after retrying", async () => {
    /**
     * The number of milliseconds that time-measuring tests can vary.
     */
    const testTolerance = 100;
  
    const endpoint = "https://example4.prismic.io/api/v2"

    let responseTries = 0;

    // Override the query endpoint to return a 429 while `responseTries` is
    // less than or equal to `retryResponseQty`
    const apiMock = nock(/example4\.prismic\.io/)
    .get('/api/v2')
    .reply((uri, requestBody, cb) => {
      responseTries++;

      if (responseTries <= 1) {
        cb(
          null,
          [
            429,
            {
              status_code: 429,
              status_message:
                "Your request count (11) is over the allowed limit of 10.",
            },
            {
              "retry-after": "invalid"
            }
          ]
        )
      } else {
        cb(null, [418])
      }
    }).persist(true)

    // Rate limited. Should reject roughly after 1000 milliseconds.
    const t0 = Date.now()
    let error;
    try {
      await Prismic.getApi(endpoint)
    } catch (_error) {
      error = _error
    }

    const t1 = Date.now()

    assert.equal(error.toString(), 'Error: Unexpected status code [418] on URL https://example4.prismic.io/api/v2')
    assert.isTrue(t1 - t0 >= 1000)
    assert.isTrue(t1 - t0 <= 1000 + testTolerance)

    apiMock.restore && apiMock.restore()
  });
});
