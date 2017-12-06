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
          var searchJson = fixtures('search.json');
          searchJson.results[0].last_publication_date = Date.now();
          cb(null, searchJson);
        } else if(url === 'http://localhost:3000/api') {
          var apiJson = fixtures('api.json');
          if (opts && opts.refresh_ref) {
            apiJson.refs = [{ id: 'master', ref: Date.now(), label: 'Master', isMasterRef: true }];
          }
          cb(null, apiJson);
        }
      },
    },
    apiDataTTL: opts && opts.ttl
  };

  return Prismic.client('http://localhost:3000/api', options);
}

describe('Cache', function() {

  it('should cache Api for 1 second', function(done) {
    function loop(client, options) {
      client.getApi().then(function(api) {
        setTimeout(function() {
          if (Date.now() - options.start < options.duration) {
            options.check(api);
            loop(client, options);
          } else {
            options.done(api);
          }
        }, options.delay);
      });
    }

    var client = getClient({ ttl: 1, refresh_ref: true });
    client.getApi().then(function(api) {
      loop(client, {
        start: api.master(),
        delay: 125,
        duration: 1100,
        check: function(cachedApi) {
          assert.strictEqual(cachedApi.master(), api.master());
        },
        done: function(refreshedApi) {
          assert.notEqual(refreshedApi.master(), api.master());
          done();
        }
      });
    }).catch(done);
  });
});
