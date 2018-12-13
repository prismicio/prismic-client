var path = require('path');
var querystring = require('querystring');
var chai = require('chai');
var assert = chai.assert;
var Prismic = require(path.join(__dirname, '../', 'dist', 'prismic-javascript.min.js'));
var fs = require('fs');

function fixtures(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', file)));
}

function getApi() {
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

  return Prismic.getApi('http://localhost:3000/api', options);
}

describe('Api', function() {

  it('should access to master ref', function(done) {
    getApi().then(function(api) {
      assert.strictEqual(api.master(), 'WYx9HB8AAB8AmX7z');
      done();
    }).catch(done);
  });

  it('should access to forms', function(done) {
    getApi().then(function(api) {
      assert.exists(api.everything());
      assert.exists(api.form('documentation'));
      done();
    }).catch(done);
  });

  it('should access to current experiment', function(done) {
    getApi().then(function(api) {
      assert.strictEqual('experimentA', api.currentExperiment().name());
      assert.strictEqual('variationA', api.currentExperiment().variations[0].label());
      done();
    }).catch(done);
  });

  it('should access to bookmarks', function(done) {
    getApi().then(function(api) {
      assert.strictEqual('UfkL59_mqdr73EGn', api.bookmarks.faq);
      done();
    }).catch(done);
  });

  it('should access to ref from label', function(done) {
    getApi().then(function(api) {
      assert.strictEqual('WJr3eikAAClRybU5~WYx9HB8AAB8AmX7z', api.ref('Documentation'));
      done();
    }).catch(done);
  });

  it('should access to refs', function(done) {
    getApi().then(function(api) {
      assert.strictEqual('WYx9HB8AAB8AmX7z', api.refs[0].ref);
      done();
    }).catch(done);
  });

  it('should access to tags', function(done) {
    getApi().then(function(api) {
      assert.strictEqual('contentwriter', api.tags[0]);
      done();
    }).catch(done);
  });

  it('should access to types', function(done) {
    getApi().then(function(api) {
      assert.strictEqual('Post Page', api.types.post);
      done();
    }).catch(done);
  });

  it('should retrieve content', function(done) {
    getApi().then(function(api) {
      return api.everything().submit().then(function(response) {
        assert.strictEqual(response.page, 2);
        assert.strictEqual(response.results_per_page, 20);
        assert.strictEqual(response.results_size, 20);
        assert.strictEqual(response.total_results_size, 228);
        assert.strictEqual(response.total_pages, 12);
        assert.strictEqual(response.next_page, 'http://localhost:3000/api/v2/documents/search?ref=WYx9HB8AAB8AmX7z&page=3&pageSize=20');
        assert.strictEqual(response.prev_page, 'http://localhost:3000/api/v2/documents/search?ref=WYx9HB8AAB8AmX7z&page=1&pageSize=20');

        var document = response.results[0];
        assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');
        assert.strictEqual(document.uid, 'renaudbressand');
        assert.strictEqual(document.type, 'author');
        assert.strictEqual(document.href, 'http://localhost:3000/api/v2/documents/search?ref=WYx9HB8AAB8AmX7z&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22WW4bKScAAMAqmluX%22%29+%5D%5D');
        assert.deepEqual(document.tags, ['tagA', 'tagB']);
        assert.strictEqual(document.first_publication_date, '2017-07-18T14:29:39+0000');
        assert.strictEqual(document.last_publication_date, '2017-08-10T15:34:52+0000');
        assert.strictEqual(document.lang, 'en-us');

        done();
      })
    }).catch(done);
  });

  it('should query first document', function(done) {
    getApi().then(function(api) {
      return api.queryFirst(Prismic.Predicates.at('my.product.price', 20)).then(function(document) {
        assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');

        done();
      });
    }).catch(done);
  });

  it('should query one document by id', function(done) {
    getApi().then(function(api) {
      return api.getByID('WW4bKScAAMAqmluX').then(function(document) {
        assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');

        done();
      });
    }).catch(done);
  });

  it('should query n documents by ids', function(done) {
    getApi().then(function(api) {
      return api.getByIDs(['WW4bKScAAMAqmluX', 'WHT6MCgAAAUYJMjN']).then(function(response) {
        var document = response.results[0];
        assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');

        done();
      });
    }).catch(done);
  });

  it('should query single document', function(done) {
    getApi().then(function(api) {
      return api.getSingle('product').then(function(document) {
        assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');

        done();
      });
    }).catch(done);
  });

  it('should query one document by bookmark', function(done) {
    getApi().then(function(api) {
      return api.getBookmark('faq').then(function(document) {
        assert.strictEqual(document.id, 'WW4bKScAAMAqmluX');

        done();
      });
    }).catch(done);
  });
});
