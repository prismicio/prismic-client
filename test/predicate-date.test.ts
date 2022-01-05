import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[date.after(document.first_publication_date, "2017-05-18T17:00:00-0500")]',
	isTitleMacro,
	prismic.predicate.dateAfter(
		"document.first_publication_date",
		"2017-05-18T17:00:00-0500",
	),
);

test(
	"[date.after(document.last_publication_date, 1495080000000)]",
	isTitleMacro,
	prismic.predicate.dateAfter("document.last_publication_date", 1495080000000),
);

test(
	'[date.after(my.article.release-date, "2017-01-22")]',
	isTitleMacro,
	prismic.predicate.dateAfter("my.article.release-date", "2017-01-22"),
);

test(
	"[date.after(my.article.release-date, 1485043200000)]",
	isTitleMacro,
	prismic.predicate.dateAfter(
		"my.article.release-date",
		Date.parse("2017-01-22"),
	),
);

test(
	'[date.before(document.first_publication_date, "2016-09-19T14:00:00-0400")]',
	isTitleMacro,
	prismic.predicate.dateBefore(
		"document.first_publication_date",
		"2016-09-19T14:00:00-0400",
	),
);

test(
	"[date.before(document.last_publication_date, 1476504000000)]",
	isTitleMacro,
	prismic.predicate.dateBefore("document.last_publication_date", 1476504000000),
);

test(
	'[date.before(my.post.date, "2017-02-24")]',
	isTitleMacro,
	prismic.predicate.dateBefore("my.post.date", "2017-02-24"),
);

test(
	"[date.before(my.post.date, 1487894400000)]",
	isTitleMacro,
	prismic.predicate.dateBefore("my.post.date", Date.parse("2017-02-24")),
);

test(
	'[date.between(document.first_publication_date, "2017-01-16", "2017-01-20")]',
	isTitleMacro,
	prismic.predicate.dateBetween(
		"document.first_publication_date",
		"2017-01-16",
		"2017-01-20",
	),
);

test(
	'[date.between(document.last_publication_date, "2016-09-15T05:30:00+0100", "2017-10-15T11:45:00+0100")]',
	isTitleMacro,
	prismic.predicate.dateBetween(
		"document.last_publication_date",
		"2016-09-15T05:30:00+0100",
		"2017-10-15T11:45:00+0100",
	),
);

test(
	"[date.between(my.query-fields.date, 1483074000000, 1483333200000)]",
	isTitleMacro,
	prismic.predicate.dateBetween(
		"my.query-fields.date",
		1483074000000,
		1483333200000,
	),
);

test(
	"[date.between(my.query-fields.date, 1583074000000, 1583333200000)]",
	isTitleMacro,
	prismic.predicate.dateBetween(
		"my.query-fields.date",
		new Date(1583074000000),
		new Date(1583333200000),
	),
);

test(
	"[date.day-of-month(document.first_publication_date, 22)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonth("document.first_publication_date", 22),
);

test(
	"[date.day-of-month(document.last_publication_date, 30)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonth("document.last_publication_date", 30),
);

test(
	"[date.day-of-month(my.post.date, 14)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonth("my.post.date", 14),
);

test(
	"[date.day-of-month-after(document.first_publication_date, 22)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonthAfter("document.first_publication_date", 22),
);

test(
	"[date.day-of-month-after(document.last_publication_date, 10)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonthAfter("document.last_publication_date", 10),
);

test(
	"[date.day-of-month-after(my.event.date-and-time, 15)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonthAfter("my.event.date-and-time", 15),
);

test(
	"[date.day-of-month-before(document.first_publication_date, 20)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonthBefore("document.first_publication_date", 20),
);

test(
	"[date.day-of-month-before(document.last_publication_date, 10)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonthBefore("document.last_publication_date", 10),
);

test(
	"[date.day-of-month-before(my.blog-post.release-date, 23)]",
	isTitleMacro,
	prismic.predicate.dateDayOfMonthBefore("my.blog-post.release-date", 23),
);

test(
	'[date.day-of-week(document.first_publication_date, "monday")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeek("document.first_publication_date", "monday"),
);

test(
	'[date.day-of-week(document.last_publication_date, "sun")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeek("document.last_publication_date", "sun"),
);

test(
	'[date.day-of-week(my.concert.show-date, "Friday")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeek("my.concert.show-date", "Friday"),
);

test(
	"[date.day-of-week(my.concert.show-date, 5)]",
	isTitleMacro,
	prismic.predicate.dateDayOfWeek("my.concert.show-date", 5),
);

test(
	'[date.day-of-week-after(document.first_publication_date, "fri")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeekAfter(
		"document.first_publication_date",
		"fri",
	),
);

test(
	'[date.day-of-week-after(document.last_publication_date, "Thu")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeekAfter("document.last_publication_date", "Thu"),
);

test(
	'[date.day-of-week-after(my.blog-post.date, "tuesday")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeekAfter("my.blog-post.date", "tuesday"),
);

test(
	"[date.day-of-week-after(my.blog-post.date, 2)]",
	isTitleMacro,
	prismic.predicate.dateDayOfWeekAfter("my.blog-post.date", 2),
);

test(
	'[date.day-of-week-before(document.first_publication_date, "Wed")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeekBefore(
		"document.first_publication_date",
		"Wed",
	),
);

test(
	'[date.day-of-week-before(document.last_publication_date, "saturday")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeekBefore(
		"document.last_publication_date",
		"saturday",
	),
);

test(
	'[date.day-of-week-before(my.page.release-date, "Saturday")]',
	isTitleMacro,
	prismic.predicate.dateDayOfWeekBefore("my.page.release-date", "Saturday"),
);

test(
	"[date.day-of-week-before(my.page.release-date, 6)]",
	isTitleMacro,
	prismic.predicate.dateDayOfWeekBefore("my.page.release-date", 6),
);

test(
	'[date.month(document.first_publication_date, "august")]',
	isTitleMacro,
	prismic.predicate.dateMonth("document.first_publication_date", "august"),
);

test(
	'[date.month(document.last_publication_date, "Sep")]',
	isTitleMacro,
	prismic.predicate.dateMonth("document.last_publication_date", "Sep"),
);

test(
	"[date.month(my.blog-post.date, 1)]",
	isTitleMacro,
	prismic.predicate.dateMonth("my.blog-post.date", 1),
);

test(
	'[date.month-after(document.first_publication_date, "February")]',
	isTitleMacro,
	prismic.predicate.dateMonthAfter(
		"document.first_publication_date",
		"February",
	),
);

test(
	"[date.month-after(document.last_publication_date, 6)]",
	isTitleMacro,
	prismic.predicate.dateMonthAfter("document.last_publication_date", 6),
);

test(
	'[date.month-after(my.article.date, "oct")]',
	isTitleMacro,
	prismic.predicate.dateMonthAfter("my.article.date", "oct"),
);

test(
	"[date.month-before(document.first_publication_date, 8)]",
	isTitleMacro,
	prismic.predicate.dateMonthBefore("document.first_publication_date", 8),
);

test(
	'[date.month-before(document.last_publication_date, "june")]',
	isTitleMacro,
	prismic.predicate.dateMonthBefore("document.last_publication_date", "june"),
);

test(
	'[date.month-before(my.blog-post.release-date, "Sep")]',
	isTitleMacro,
	prismic.predicate.dateMonthBefore("my.blog-post.release-date", "Sep"),
);

test(
	"[date.year(document.first_publication_date, 2016)]",
	isTitleMacro,
	prismic.predicate.dateYear("document.first_publication_date", 2016),
);

test(
	"[date.year(document.last_publication_date, 2017)]",
	isTitleMacro,
	prismic.predicate.dateYear("document.last_publication_date", 2017),
);

test(
	"[date.year(my.employee.birthday, 1986)]",
	isTitleMacro,
	prismic.predicate.dateYear("my.employee.birthday", 1986),
);

test(
	"[date.hour(document.first_publication_date, 12)]",
	isTitleMacro,
	prismic.predicate.dateHour("document.first_publication_date", 12),
);

test(
	"[date.hour(document.last_publication_date, 8)]",
	isTitleMacro,
	prismic.predicate.dateHour("document.last_publication_date", 8),
);

test(
	"[date.hour(my.event.date-and-time, 19)]",
	isTitleMacro,
	prismic.predicate.dateHour("my.event.date-and-time", 19),
);

test(
	"[date.hour-after(document.first_publication_date, 21)]",
	isTitleMacro,
	prismic.predicate.dateHourAfter("document.first_publication_date", 21),
);

test(
	"[date.hour-after(document.last_publication_date, 8)]",
	isTitleMacro,
	prismic.predicate.dateHourAfter("document.last_publication_date", 8),
);

test(
	"[date.hour-after(my.blog-post.releaseDate, 16)]",
	isTitleMacro,
	prismic.predicate.dateHourAfter("my.blog-post.releaseDate", 16),
);

test(
	"[date.hour-before(document.first_publication_date, 10)]",
	isTitleMacro,
	prismic.predicate.dateHourBefore("document.first_publication_date", 10),
);

test(
	"[date.hour-before(document.last_publication_date, 12)]",
	isTitleMacro,
	prismic.predicate.dateHourBefore("document.last_publication_date", 12),
);

test(
	"[date.hour-before(my.event.dateAndTime, 12)]",
	isTitleMacro,
	prismic.predicate.dateHourBefore("my.event.dateAndTime", 12),
);
