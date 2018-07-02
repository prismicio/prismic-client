var path = require('path');
var chai = require('chai');
var assert = chai.assert;
var Prismic = require(path.join(__dirname, '../', 'dist', 'prismic-javascript.min.js'));
var fs = require('fs');
var querystring = require('querystring');

function fixtures(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', file)));
}

function getClient() {
  var options = {
    requestHandler: {
      request: function(url, cb) {
        if (url.startsWith('http://localhost:3000/api/v2/documents/search')) {
          cb(null, fixtures('search.json'));
        } else if(url === 'http://localhost:3000/api') {
          cb(null, fixtures('api.json'));
        }
      },
    },
  };

  return Prismic.client('http://localhost:3000/api', options);
}

describe('Prismic', function() {

  var client = getClient();

  it('should query', function(done) {
    client.query(Prismic.Predicates.at('document.type', 'product')).then(function (response) {
      assert.strictEqual(response.results.length, 20);
      done();
    }).catch(done);
  });

  it('should query first document', function(done) {
    client.queryFirst(Prismic.Predicates.at('document.type', 'product')).then(function (document) {
      assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
      done();
    }).catch(done);
  });

  it('should query one document by id', function(done) {
    client.getByID('WW4bKScAAMAqmluX').then(function (document) {
      assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
      done();
    }).catch(done);
  });

  it('should query n documents by ids', function(done) {
    client.getByIDs(['WW4bKScAAMAqmluX', 'WHT6MCgAAAUYJMjN']).then(function(response) {
      var document = response.results[0];
      assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
      done();
    }).catch(done);
  });

  it('should query single document', function(done) {
    client.getSingle('product').then(function(document) {
      assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
      done();

    }).catch(done);
  });

  it('should query one document by uid', function(done) {
    client.getByUID('product', 'how-to-query-the-api').then(function(document) {
      assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
      done();
    }).catch(done);
  });

  it('should query one document by bookmark', function(done) {
    client.getBookmark('faq').then(function(document) {
      assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
      done();
    }).catch(done);
  });

  it('should build query', function(done) {
    var ref = 'AAAAA';
    var pageSize = 8;
    var page = 2;
    var lang = 'en-US';
    var after = 'XXXXX';
    var accessToken = 'YYYYY';
    var query = ['at(document.type, "product")'];
    var orderings = ['my.product.price'];
    var fetchLinks = 'people.name, people.age';
    var fetch = 'product.title, product.desc';

    function wrap(arr) {
      return '[' + arr.join(',') + ']';
    }

    client
      .everything()
      .query(query)
      .ref(ref)
      .pageSize(pageSize)
      .lang(lang)
      .page(page)
      .orderings(orderings)
      .fetchLinks(fetchLinks)
      .fetch(fetch)
      .after(after)
      .set('access_token', accessToken)
      .url().then(function(url) {
        var qs = querystring.parse(url.split('?')[1]);

        assert.strictEqual(qs.ref, ref);
        assert.equal(qs.pageSize, pageSize);
        assert.equal(qs.page, page);
        assert.strictEqual(qs.lang, lang);
        assert.strictEqual(qs.after, after);
        assert.strictEqual(qs['access_token'], accessToken);
        assert.strictEqual(qs.q, wrap(query));
        assert.strictEqual(qs.orderings, wrap(orderings));
        assert.strictEqual(qs.fetchLinks, fetchLinks);
        assert.strictEqual(qs.fetch, fetch);

        done();
      }).catch(done);
  });
});
