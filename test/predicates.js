var path = require('path');
var chai = require('chai');
var assert = chai.assert;
var Prismic = require(path.join(__dirname, '../', 'dist', 'prismic-javascript.min.js'));

describe('Predicates', function() {

  it('should build at query with number value', function() {
    assert.strictEqual(
      Prismic.Predicates.at('my.product.price', 10),
      '[at(my.product.price, 10)]'
    );
  });

  it('should build at query with date value', function() {
    var date = new Date();
    assert.strictEqual(
      Prismic.Predicates.at('my.product.date', date),
      '[at(my.product.date, ' + date.getTime() + ')]'
    );
  });

  it('should build at query with date values', function() {
    var dateA = new Date();
    var dateB = new Date();
    assert.strictEqual(
      Prismic.Predicates.at('my.product.date', [dateA, dateB]),
      '[at(my.product.date, [' + dateA.getTime() + ',' + dateB.getTime() + '])]'
    );
  });

  it('should build at query with number values', function() {
    assert.strictEqual(
      Prismic.Predicates.at('my.product.price', [10, 11]),
      '[at(my.product.price, [10,11])]'
    );
  });

  it('should build at query with string values', function() {
    assert.strictEqual(
      Prismic.Predicates.at('document.tags', ['tagA', 'tagB']),
      '[at(document.tags, ["tagA","tagB"])]'
    );
  });

  it('should build at query with string value', function() {
    assert.strictEqual(
      Prismic.Predicates.at('my.product.type', 'chair'),
      '[at(my.product.type, "chair")]'
    );
  });

  it('should build not query with string value', function() {
    assert.strictEqual(
      Prismic.Predicates.not('my.product.type', 'chair'),
      '[not(my.product.type, "chair")]'
    );
  });

  it('should build not query with number value', function() {
    assert.strictEqual(
      Prismic.Predicates.not('my.product.price', 10),
      '[not(my.product.price, 10)]'
    );
  });

  it('should build missing query', function() {
    assert.strictEqual(
      Prismic.Predicates.missing('my.product.desc'),
      '[missing(my.product.desc)]'
    );
  });

  it('should build has query', function() {
    assert.strictEqual(
      Prismic.Predicates.has('my.product.desc'),
      '[has(my.product.desc)]'
    );
  });

  it('should build any query with string values', function() {
    assert.strictEqual(
      Prismic.Predicates.any('my.product.type', ['chair', 'table']),
      '[any(my.product.type, ["chair","table"])]'
    );
  });

  it('should build any query with number values', function() {
    assert.strictEqual(
      Prismic.Predicates.any('my.product.price', [10, 20]),
      '[any(my.product.price, [10,20])]'
    );
  });

  it('should build in query with string values', function() {
    assert.strictEqual(
      Prismic.Predicates.in('document.id', ['AAAAA', 'BBBBB']),
      '[in(document.id, ["AAAAA","BBBBB"])]'
    );
  });

  it('should build fulltext query', function() {
    assert.strictEqual(
      Prismic.Predicates.fulltext('my.product.desc', 'phone'),
      '[fulltext(my.product.desc, "phone")]'
    );
  });

  it('should build similar query', function() {
    assert.strictEqual(
      Prismic.Predicates.similar('AAAAA', 10),
      '[similar("AAAAA", 10)]'
    );
  });

  it('should build number.gt query', function() {
    assert.strictEqual(
      Prismic.Predicates.number.gt('my.product.price', 10),
      '[number.gt(my.product.price, 10)]'
    );

    assert.strictEqual(
      Prismic.Predicates.gt('my.product.price', 10),
      '[number.gt(my.product.price, 10)]'
    );
  });

  it('should build number.lt query', function() {
    assert.strictEqual(
      Prismic.Predicates.number.lt('my.product.price', 10),
      '[number.lt(my.product.price, 10)]'
    );

    assert.strictEqual(
      Prismic.Predicates.lt('my.product.price', 10),
      '[number.lt(my.product.price, 10)]'
    );
  });

  it('should build date.before query with timestamp value', function() {
    var date = new Date();
    var timestamp = date.getTime();

    assert.strictEqual(
      Prismic.Predicates.date.before('my.product.date', timestamp),
      '[date.before(my.product.date, ' + timestamp + ')]'
    );

    assert.strictEqual(
      Prismic.Predicates.dateBefore('my.product.date', timestamp),
      '[date.before(my.product.date, ' + timestamp + ')]'
    );
  });

  it('should build date.before query with string value', function() {
    assert.strictEqual(
      Prismic.Predicates.date.before('my.product.date', '2017-08-24'),
      '[date.before(my.product.date, "2017-08-24")]'
    );

    assert.strictEqual(
      Prismic.Predicates.dateBefore('my.product.date', '2017-08-24'),
      '[date.before(my.product.date, "2017-08-24")]'
    );
  });

  it('should build date.before query with Date value', function() {
    var date = new Date();

    assert.strictEqual(
      Prismic.Predicates.date.before('my.product.date', date),
      '[date.before(my.product.date, ' + date.getTime() + ')]'
    );

    assert.strictEqual(
      Prismic.Predicates.dateBefore('my.product.date', date),
      '[date.before(my.product.date, ' + date.getTime() + ')]'
    );
  });

  it('should build date.after query', function() {
    var date = new Date();
    assert.strictEqual(
      Prismic.Predicates.date.after('my.product.date', date),
      '[date.after(my.product.date, ' + date.getTime() + ')]'
    );

    assert.strictEqual(
      Prismic.Predicates.dateAfter('my.product.date', date),
      '[date.after(my.product.date, ' + date.getTime() + ')]'
    );
  });

  it('should build date.between query', function() {
    var dateA = new Date();
    var dateB = new Date();
    assert.strictEqual(
      Prismic.Predicates.date.between('my.product.date', dateA, dateB),
      '[date.between(my.product.date, ' + dateA.getTime() + ', ' + dateB.getTime() + ')]'
    );

    assert.strictEqual(
      Prismic.Predicates.dateBetween('my.product.date', dateA, dateB),
      '[date.between(my.product.date, ' + dateA.getTime() + ', ' + dateB.getTime() + ')]'
    );
  });

  it('should build date.day-of-month query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.dayOfMonth('my.product.date', 14),
      '[date.day-of-month(my.product.date, 14)]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfMonth('my.product.date', 14),
      '[date.day-of-month(my.product.date, 14)]'
    );
  });

  it('should build date.day-of-month-after query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.dayOfMonthAfter('my.product.date', 14),
      '[date.day-of-month-after(my.product.date, 14)]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfMonthAfter('my.product.date', 14),
      '[date.day-of-month-after(my.product.date, 14)]'
    );
  });

  it('should build date.day-of-month-before query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.dayOfMonthBefore('my.product.date', 14),
      '[date.day-of-month-before(my.product.date, 14)]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfMonthBefore('my.product.date', 14),
      '[date.day-of-month-before(my.product.date, 14)]'
    );
  });

  it('should build date.day-of-week query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.dayOfWeek('my.product.date', 2),
      '[date.day-of-week(my.product.date, 2)]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfWeek('my.product.date', 'monday'),
      '[date.day-of-week(my.product.date, "monday")]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfWeek('my.product.date', 2),
      '[date.day-of-week(my.product.date, 2)]'
    );
  });

  it('should build date.day-of-week-after query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.dayOfWeekAfter('my.product.date', 2),
      '[date.day-of-week-after(my.product.date, 2)]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfWeekAfter('my.product.date', 'monday'),
      '[date.day-of-week-after(my.product.date, "monday")]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfWeekAfter('my.product.date', 2),
      '[date.day-of-week-after(my.product.date, 2)]'
    );
  });

  it('should build date.day-of-week-before query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.dayOfWeekBefore('my.product.date', 2),
      '[date.day-of-week-before(my.product.date, 2)]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfWeekBefore('my.product.date', 'monday'),
      '[date.day-of-week-before(my.product.date, "monday")]'
    );

    assert.strictEqual(
      Prismic.Predicates.dayOfWeekBefore('my.product.date', 2),
      '[date.day-of-week-before(my.product.date, 2)]'
    );
  });

  it('should build date.month query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.month('my.product.date', 10),
      '[date.month(my.product.date, 10)]'
    );

    assert.strictEqual(
      Prismic.Predicates.month('my.product.date', 10),
      '[date.month(my.product.date, 10)]'
    );
  });

  it('should build date.month-after query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.monthAfter('my.product.date', 10),
      '[date.month-after(my.product.date, 10)]'
    );

    assert.strictEqual(
      Prismic.Predicates.monthAfter('my.product.date', 10),
      '[date.month-after(my.product.date, 10)]'
    );
  });

  it('should build date.month-before query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.monthBefore('my.product.date', 10),
      '[date.month-before(my.product.date, 10)]'
    );

    assert.strictEqual(
      Prismic.Predicates.monthBefore('my.product.date', 10),
      '[date.month-before(my.product.date, 10)]'
    );
  });

  it('should build date.year query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.year('my.product.date', 2017),
      '[date.year(my.product.date, 2017)]'
    );

    assert.strictEqual(
      Prismic.Predicates.year('my.product.date', 2017),
      '[date.year(my.product.date, 2017)]'
    );
  });

  it('should build date.hour query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.hour('my.product.date', 14),
      '[date.hour(my.product.date, 14)]'
    );

    assert.strictEqual(
      Prismic.Predicates.hour('my.product.date', 14),
      '[date.hour(my.product.date, 14)]'
    );
  });

  it('should build date.hour-after query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.hourAfter('my.product.date', 14),
      '[date.hour-after(my.product.date, 14)]'
    );

    assert.strictEqual(
      Prismic.Predicates.hourAfter('my.product.date', 14),
      '[date.hour-after(my.product.date, 14)]'
    );
  });

  it('should build date.hour-before query', function() {
    assert.strictEqual(
      Prismic.Predicates.date.hourBefore('my.product.date', 14),
      '[date.hour-before(my.product.date, 14)]'
    );

    assert.strictEqual(
      Prismic.Predicates.hourBefore('my.product.date', 14),
      '[date.hour-before(my.product.date, 14)]'
    );
  });

  it('should build geopoint.near query', function() {
    assert.strictEqual(
      Prismic.Predicates.geopoint.near('my.product.shop', 48.23232323, 1.72323232, 1000),
      '[geopoint.near(my.product.shop, 48.23232323, 1.72323232, 1000)]'
    );

    assert.strictEqual(
      Prismic.Predicates.near('my.product.shop', 48.23232323, 1.72323232, 1000),
      '[geopoint.near(my.product.shop, 48.23232323, 1.72323232, 1000)]'
    );
  });
});

