var path = require('path');
var chai = require('chai');
var assert = chai.assert;
var Prismic = require(path.join(__dirname, '../', 'dist', 'prismic-javascript.min.js'));
var fs = require('fs');

function fixtures(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', file)));
}

function getClient(opts) {
  var options = {
    requestHandler: {
      request: function(url, cb) {
        if (url.startsWith('http://localhost:3000/api/v2/documents/search')) {
          cb(null, fixtures('search.json'));
        } else if(url === 'http://localhost:3000/api') {
          var apiJson = fixtures('api.json');
          apiJson.refs = [{ id: 'master', ref: Date.now(), label: 'Master', isMasterRef: true }];
          cb(null, apiJson);
        }
      },
    },
    apiDataTTL: opts.ttl
  };

  return Prismic.client('http://localhost:3000/api', options);
}

function loop(client, options) {
  client.getApi().then(function(api) {
    setTimeout(function() {
      if (Date.now() - options.start < options.duration) {
        options.check(api);
        loop(client, options);
      } else {
        options.end(api);
      }
    }, options.delay);
  });
}

describe('Api', function() {

  var client = getClient({ ttl: 1 });

  it('should expire after 1 second', function(done) {
    client.getApi().then(function(api) {
      loop(client, {
        start: api.master(),
        delay: 125,
        duration: 1100,
        check: function(cachedApi) {
          assert.strictEqual(cachedApi.master(), api.master());
        },
        end: function(refreshedApi) {
          assert.notEqual(refreshedApi.master(), api.master());
          done();
        }
      });
    }).catch(done);
  });
});
