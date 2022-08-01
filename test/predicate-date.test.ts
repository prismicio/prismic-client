import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[date.after(document.first_publication_date, "2017-05-18T17:00:00-0500")]',
	prismic.predicate.dateAfter(
		"document.first_publication_date",
		"2017-05-18T17:00:00-0500",
	),
);

testPredicate(
	"[date.after(document.last_publication_date, 1495080000000)]",
	prismic.predicate.dateAfter("document.last_publication_date", 1495080000000),
);

testPredicate(
	'[date.after(my.article.release-date, "2017-01-22")]',
	prismic.predicate.dateAfter("my.article.release-date", "2017-01-22"),
);

testPredicate(
	"[date.after(my.article.release-date, 1485043200000)]",
	prismic.predicate.dateAfter(
		"my.article.release-date",
		Date.parse("2017-01-22"),
	),
);

testPredicate(
	'[date.before(document.first_publication_date, "2016-09-19T14:00:00-0400")]',
	prismic.predicate.dateBefore(
		"document.first_publication_date",
		"2016-09-19T14:00:00-0400",
	),
);

testPredicate(
	"[date.before(document.last_publication_date, 1476504000000)]",
	prismic.predicate.dateBefore("document.last_publication_date", 1476504000000),
);

testPredicate(
	'[date.before(my.post.date, "2017-02-24")]',
	prismic.predicate.dateBefore("my.post.date", "2017-02-24"),
);

testPredicate(
	"[date.before(my.post.date, 1487894400000)]",
	prismic.predicate.dateBefore("my.post.date", Date.parse("2017-02-24")),
);

testPredicate(
	'[date.between(document.first_publication_date, "2017-01-16", "2017-01-20")]',
	prismic.predicate.dateBetween(
		"document.first_publication_date",
		"2017-01-16",
		"2017-01-20",
	),
);

testPredicate(
	'[date.between(document.last_publication_date, "2016-09-15T05:30:00+0100", "2017-10-15T11:45:00+0100")]',
	prismic.predicate.dateBetween(
		"document.last_publication_date",
		"2016-09-15T05:30:00+0100",
		"2017-10-15T11:45:00+0100",
	),
);

testPredicate(
	"[date.between(my.query-fields.date, 1483074000000, 1483333200000)]",
	prismic.predicate.dateBetween(
		"my.query-fields.date",
		1483074000000,
		1483333200000,
	),
);

testPredicate(
	"[date.between(my.query-fields.date, 1583074000000, 1583333200000)]",
	prismic.predicate.dateBetween(
		"my.query-fields.date",
		new Date(1583074000000),
		new Date(1583333200000),
	),
);

testPredicate(
	"[date.day-of-month(document.first_publication_date, 22)]",
	prismic.predicate.dateDayOfMonth("document.first_publication_date", 22),
);

testPredicate(
	"[date.day-of-month(document.last_publication_date, 30)]",
	prismic.predicate.dateDayOfMonth("document.last_publication_date", 30),
);

testPredicate(
	"[date.day-of-month(my.post.date, 14)]",
	prismic.predicate.dateDayOfMonth("my.post.date", 14),
);

testPredicate(
	"[date.day-of-month-after(document.first_publication_date, 22)]",
	prismic.predicate.dateDayOfMonthAfter("document.first_publication_date", 22),
);

testPredicate(
	"[date.day-of-month-after(document.last_publication_date, 10)]",
	prismic.predicate.dateDayOfMonthAfter("document.last_publication_date", 10),
);

testPredicate(
	"[date.day-of-month-after(my.event.date-and-time, 15)]",
	prismic.predicate.dateDayOfMonthAfter("my.event.date-and-time", 15),
);

testPredicate(
	"[date.day-of-month-before(document.first_publication_date, 20)]",
	prismic.predicate.dateDayOfMonthBefore("document.first_publication_date", 20),
);

testPredicate(
	"[date.day-of-month-before(document.last_publication_date, 10)]",
	prismic.predicate.dateDayOfMonthBefore("document.last_publication_date", 10),
);

testPredicate(
	"[date.day-of-month-before(my.blog-post.release-date, 23)]",
	prismic.predicate.dateDayOfMonthBefore("my.blog-post.release-date", 23),
);

testPredicate(
	'[date.day-of-week(document.first_publication_date, "monday")]',
	prismic.predicate.dateDayOfWeek("document.first_publication_date", "monday"),
);

testPredicate(
	'[date.day-of-week(document.last_publication_date, "sun")]',
	prismic.predicate.dateDayOfWeek("document.last_publication_date", "sun"),
);

testPredicate(
	'[date.day-of-week(my.concert.show-date, "Friday")]',
	prismic.predicate.dateDayOfWeek("my.concert.show-date", "Friday"),
);

testPredicate(
	"[date.day-of-week(my.concert.show-date, 5)]",
	prismic.predicate.dateDayOfWeek("my.concert.show-date", 5),
);

testPredicate(
	'[date.day-of-week-after(document.first_publication_date, "fri")]',
	prismic.predicate.dateDayOfWeekAfter(
		"document.first_publication_date",
		"fri",
	),
);

testPredicate(
	'[date.day-of-week-after(document.last_publication_date, "Thu")]',
	prismic.predicate.dateDayOfWeekAfter("document.last_publication_date", "Thu"),
);

testPredicate(
	'[date.day-of-week-after(my.blog-post.date, "tuesday")]',
	prismic.predicate.dateDayOfWeekAfter("my.blog-post.date", "tuesday"),
);

testPredicate(
	"[date.day-of-week-after(my.blog-post.date, 2)]",
	prismic.predicate.dateDayOfWeekAfter("my.blog-post.date", 2),
);

testPredicate(
	'[date.day-of-week-before(document.first_publication_date, "Wed")]',
	prismic.predicate.dateDayOfWeekBefore(
		"document.first_publication_date",
		"Wed",
	),
);

testPredicate(
	'[date.day-of-week-before(document.last_publication_date, "saturday")]',
	prismic.predicate.dateDayOfWeekBefore(
		"document.last_publication_date",
		"saturday",
	),
);

testPredicate(
	'[date.day-of-week-before(my.page.release-date, "Saturday")]',
	prismic.predicate.dateDayOfWeekBefore("my.page.release-date", "Saturday"),
);

testPredicate(
	"[date.day-of-week-before(my.page.release-date, 6)]",
	prismic.predicate.dateDayOfWeekBefore("my.page.release-date", 6),
);

testPredicate(
	'[date.month(document.first_publication_date, "august")]',
	prismic.predicate.dateMonth("document.first_publication_date", "august"),
);

testPredicate(
	'[date.month(document.last_publication_date, "Sep")]',
	prismic.predicate.dateMonth("document.last_publication_date", "Sep"),
);

testPredicate(
	"[date.month(my.blog-post.date, 1)]",
	prismic.predicate.dateMonth("my.blog-post.date", 1),
);

testPredicate(
	'[date.month-after(document.first_publication_date, "February")]',
	prismic.predicate.dateMonthAfter(
		"document.first_publication_date",
		"February",
	),
);

testPredicate(
	"[date.month-after(document.last_publication_date, 6)]",
	prismic.predicate.dateMonthAfter("document.last_publication_date", 6),
);

testPredicate(
	'[date.month-after(my.article.date, "oct")]',
	prismic.predicate.dateMonthAfter("my.article.date", "oct"),
);

testPredicate(
	"[date.month-before(document.first_publication_date, 8)]",
	prismic.predicate.dateMonthBefore("document.first_publication_date", 8),
);

testPredicate(
	'[date.month-before(document.last_publication_date, "june")]',
	prismic.predicate.dateMonthBefore("document.last_publication_date", "june"),
);

testPredicate(
	'[date.month-before(my.blog-post.release-date, "Sep")]',
	prismic.predicate.dateMonthBefore("my.blog-post.release-date", "Sep"),
);

testPredicate(
	"[date.year(document.first_publication_date, 2016)]",
	prismic.predicate.dateYear("document.first_publication_date", 2016),
);

testPredicate(
	"[date.year(document.last_publication_date, 2017)]",
	prismic.predicate.dateYear("document.last_publication_date", 2017),
);

testPredicate(
	"[date.year(my.employee.birthday, 1986)]",
	prismic.predicate.dateYear("my.employee.birthday", 1986),
);

testPredicate(
	"[date.hour(document.first_publication_date, 12)]",
	prismic.predicate.dateHour("document.first_publication_date", 12),
);

testPredicate(
	"[date.hour(document.last_publication_date, 8)]",
	prismic.predicate.dateHour("document.last_publication_date", 8),
);

testPredicate(
	"[date.hour(my.event.date-and-time, 19)]",
	prismic.predicate.dateHour("my.event.date-and-time", 19),
);

testPredicate(
	"[date.hour-after(document.first_publication_date, 21)]",
	prismic.predicate.dateHourAfter("document.first_publication_date", 21),
);

testPredicate(
	"[date.hour-after(document.last_publication_date, 8)]",
	prismic.predicate.dateHourAfter("document.last_publication_date", 8),
);

testPredicate(
	"[date.hour-after(my.blog-post.releaseDate, 16)]",
	prismic.predicate.dateHourAfter("my.blog-post.releaseDate", 16),
);

testPredicate(
	"[date.hour-before(document.first_publication_date, 10)]",
	prismic.predicate.dateHourBefore("document.first_publication_date", 10),
);

testPredicate(
	"[date.hour-before(document.last_publication_date, 12)]",
	prismic.predicate.dateHourBefore("document.last_publication_date", 12),
);

testPredicate(
	"[date.hour-before(my.event.dateAndTime, 12)]",
	prismic.predicate.dateHourBefore("my.event.dateAndTime", 12),
);
