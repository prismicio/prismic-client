var fs = require("fs");
var querystring = require('querystring');
var chai = require('chai');
var assert = chai.assert;
var Prismic = require('../dist/prismic-javascript');

function fixtures(file) {
  var content = fs.readFileSync("test/fixtures/" + file);
  return JSON.parse(content);
}

function getApi() {
  var data = fixtures('api.json');
  var api = new Prismic.Api('https://sdk-tests.prismic.io/api');
  api.data = api.parse(data);
  api.bookmarks = data.bookmarks;
  api.experiments = new Prismic.Experiments(data.experiments);
  api.refs = data.refs;
  api.tags = data.tags;
  api.types = data.types;
  api.oauthToken = data['oauth_token'];
  api.oauthInitiate = data['oauth_initiate'];
  return api;
}

describe('Api', function() {

  it('should access to master ref', function() {
    var api = getApi();
    assert.strictEqual(api.master(), 'WYx9HB8AAB8AmX7z');
  });

  it('should access to forms', function() {
    var api = getApi();
    assert.exists(api.everything());
    assert.exists(api.form('documentation'));
  });

  it('should access to current experiment', function() {
    var api = getApi();
    assert.strictEqual('experimentA', api.currentExperiment().name());
    assert.strictEqual('variationA', api.currentExperiment().variations[0].label());
  });

  it('should access to bookmarks', function() {
    var api = getApi();
    assert.strictEqual('UfkL59_mqdr73EGn', api.bookmarks.faq);
  });

  it('should access to refs', function() {
    var api = getApi();
    assert.strictEqual('WYx9HB8AAB8AmX7z', api.refs[0].ref);
  });

  it('should access to tags', function() {
    var api = getApi();
    assert.strictEqual('contentwriter', api.tags[0]);
  });

  it('should access to types', function() {
    var api = getApi();
    assert.strictEqual('Post Page', api.types.post);
  });

  it('should access to oauth initiate url', function() {
    var api = getApi();
    assert.strictEqual('https://wroom.prismic.io/auth/token', api.oauthToken);
  });

  it('should access to oauth token url', function() {
    var api = getApi();
    assert.strictEqual('https://wroom.prismic.io/auth', api.oauthInitiate);
  });

  it('should build query', function() {
    var api = getApi();
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

    var url = api
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
        .url();

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
  });
});

