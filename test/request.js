const path = require('path');
const unmock = require('unmock-node').default;
const chai = require('chai');

const assert = chai.assert;
const Prismic = require(path.join(__dirname, '../', 'dist', 'prismic-javascript.min.js'));

describe('request', () => {
  beforeEach(() => {
    unmock.on();
  });

   it('Makes a request and handels a json response', (done) => {
     Prismic.getApi('https://example.prismic.io/api/v2')
      .then((json) => {
        const data = json.data;
        assert.deepEqual(data, {
          refs: [],
          experiments: {},
          bookmarks: {},
          tags: {},
          types: {},
        });
        done();
      }).catch(done);
   });
});
