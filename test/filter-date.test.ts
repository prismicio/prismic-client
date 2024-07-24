import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	'[date.after(document.first_publication_date, "2017-05-18T17:00:00-0500")]',
	prismic.filter.dateAfter(
		"document.first_publication_date",
		"2017-05-18T17:00:00-0500",
	),
)

testFilter(
	"[date.after(document.last_publication_date, 1495080000000)]",
	prismic.filter.dateAfter("document.last_publication_date", 1495080000000),
)

testFilter(
	'[date.after(my.article.release-date, "2017-01-22")]',
	prismic.filter.dateAfter("my.article.release-date", "2017-01-22"),
)

testFilter(
	"[date.after(my.article.release-date, 1485043200000)]",
	prismic.filter.dateAfter("my.article.release-date", Date.parse("2017-01-22")),
)

testFilter(
	'[date.before(document.first_publication_date, "2016-09-19T14:00:00-0400")]',
	prismic.filter.dateBefore(
		"document.first_publication_date",
		"2016-09-19T14:00:00-0400",
	),
)

testFilter(
	"[date.before(document.last_publication_date, 1476504000000)]",
	prismic.filter.dateBefore("document.last_publication_date", 1476504000000),
)

testFilter(
	'[date.before(my.post.date, "2017-02-24")]',
	prismic.filter.dateBefore("my.post.date", "2017-02-24"),
)

testFilter(
	"[date.before(my.post.date, 1487894400000)]",
	prismic.filter.dateBefore("my.post.date", Date.parse("2017-02-24")),
)

testFilter(
	'[date.between(document.first_publication_date, "2017-01-16", "2017-01-20")]',
	prismic.filter.dateBetween(
		"document.first_publication_date",
		"2017-01-16",
		"2017-01-20",
	),
)

testFilter(
	'[date.between(document.last_publication_date, "2016-09-15T05:30:00+0100", "2017-10-15T11:45:00+0100")]',
	prismic.filter.dateBetween(
		"document.last_publication_date",
		"2016-09-15T05:30:00+0100",
		"2017-10-15T11:45:00+0100",
	),
)

testFilter(
	"[date.between(my.query-fields.date, 1483074000000, 1483333200000)]",
	prismic.filter.dateBetween(
		"my.query-fields.date",
		1483074000000,
		1483333200000,
	),
)

testFilter(
	"[date.between(my.query-fields.date, 1583074000000, 1583333200000)]",
	prismic.filter.dateBetween(
		"my.query-fields.date",
		new Date(1583074000000),
		new Date(1583333200000),
	),
)

testFilter(
	"[date.day-of-month(document.first_publication_date, 22)]",
	prismic.filter.dateDayOfMonth("document.first_publication_date", 22),
)

testFilter(
	"[date.day-of-month(document.last_publication_date, 30)]",
	prismic.filter.dateDayOfMonth("document.last_publication_date", 30),
)

testFilter(
	"[date.day-of-month(my.post.date, 14)]",
	prismic.filter.dateDayOfMonth("my.post.date", 14),
)

testFilter(
	"[date.day-of-month-after(document.first_publication_date, 22)]",
	prismic.filter.dateDayOfMonthAfter("document.first_publication_date", 22),
)

testFilter(
	"[date.day-of-month-after(document.last_publication_date, 10)]",
	prismic.filter.dateDayOfMonthAfter("document.last_publication_date", 10),
)

testFilter(
	"[date.day-of-month-after(my.event.date-and-time, 15)]",
	prismic.filter.dateDayOfMonthAfter("my.event.date-and-time", 15),
)

testFilter(
	"[date.day-of-month-before(document.first_publication_date, 20)]",
	prismic.filter.dateDayOfMonthBefore("document.first_publication_date", 20),
)

testFilter(
	"[date.day-of-month-before(document.last_publication_date, 10)]",
	prismic.filter.dateDayOfMonthBefore("document.last_publication_date", 10),
)

testFilter(
	"[date.day-of-month-before(my.blog-post.release-date, 23)]",
	prismic.filter.dateDayOfMonthBefore("my.blog-post.release-date", 23),
)

testFilter(
	'[date.day-of-week(document.first_publication_date, "monday")]',
	prismic.filter.dateDayOfWeek("document.first_publication_date", "monday"),
)

testFilter(
	'[date.day-of-week(document.last_publication_date, "sun")]',
	prismic.filter.dateDayOfWeek("document.last_publication_date", "sun"),
)

testFilter(
	'[date.day-of-week(my.concert.show-date, "Friday")]',
	prismic.filter.dateDayOfWeek("my.concert.show-date", "Friday"),
)

testFilter(
	"[date.day-of-week(my.concert.show-date, 5)]",
	prismic.filter.dateDayOfWeek("my.concert.show-date", 5),
)

testFilter(
	'[date.day-of-week-after(document.first_publication_date, "fri")]',
	prismic.filter.dateDayOfWeekAfter("document.first_publication_date", "fri"),
)

testFilter(
	'[date.day-of-week-after(document.last_publication_date, "Thu")]',
	prismic.filter.dateDayOfWeekAfter("document.last_publication_date", "Thu"),
)

testFilter(
	'[date.day-of-week-after(my.blog-post.date, "tuesday")]',
	prismic.filter.dateDayOfWeekAfter("my.blog-post.date", "tuesday"),
)

testFilter(
	"[date.day-of-week-after(my.blog-post.date, 2)]",
	prismic.filter.dateDayOfWeekAfter("my.blog-post.date", 2),
)

testFilter(
	'[date.day-of-week-before(document.first_publication_date, "Wed")]',
	prismic.filter.dateDayOfWeekBefore("document.first_publication_date", "Wed"),
)

testFilter(
	'[date.day-of-week-before(document.last_publication_date, "saturday")]',
	prismic.filter.dateDayOfWeekBefore(
		"document.last_publication_date",
		"saturday",
	),
)

testFilter(
	'[date.day-of-week-before(my.page.release-date, "Saturday")]',
	prismic.filter.dateDayOfWeekBefore("my.page.release-date", "Saturday"),
)

testFilter(
	"[date.day-of-week-before(my.page.release-date, 6)]",
	prismic.filter.dateDayOfWeekBefore("my.page.release-date", 6),
)

testFilter(
	'[date.month(document.first_publication_date, "august")]',
	prismic.filter.dateMonth("document.first_publication_date", "august"),
)

testFilter(
	'[date.month(document.last_publication_date, "Sep")]',
	prismic.filter.dateMonth("document.last_publication_date", "Sep"),
)

testFilter(
	"[date.month(my.blog-post.date, 1)]",
	prismic.filter.dateMonth("my.blog-post.date", 1),
)

testFilter(
	'[date.month-after(document.first_publication_date, "February")]',
	prismic.filter.dateMonthAfter("document.first_publication_date", "February"),
)

testFilter(
	"[date.month-after(document.last_publication_date, 6)]",
	prismic.filter.dateMonthAfter("document.last_publication_date", 6),
)

testFilter(
	'[date.month-after(my.article.date, "oct")]',
	prismic.filter.dateMonthAfter("my.article.date", "oct"),
)

testFilter(
	"[date.month-before(document.first_publication_date, 8)]",
	prismic.filter.dateMonthBefore("document.first_publication_date", 8),
)

testFilter(
	'[date.month-before(document.last_publication_date, "june")]',
	prismic.filter.dateMonthBefore("document.last_publication_date", "june"),
)

testFilter(
	'[date.month-before(my.blog-post.release-date, "Sep")]',
	prismic.filter.dateMonthBefore("my.blog-post.release-date", "Sep"),
)

testFilter(
	"[date.year(document.first_publication_date, 2016)]",
	prismic.filter.dateYear("document.first_publication_date", 2016),
)

testFilter(
	"[date.year(document.last_publication_date, 2017)]",
	prismic.filter.dateYear("document.last_publication_date", 2017),
)

testFilter(
	"[date.year(my.employee.birthday, 1986)]",
	prismic.filter.dateYear("my.employee.birthday", 1986),
)

testFilter(
	"[date.hour(document.first_publication_date, 12)]",
	prismic.filter.dateHour("document.first_publication_date", 12),
)

testFilter(
	"[date.hour(document.last_publication_date, 8)]",
	prismic.filter.dateHour("document.last_publication_date", 8),
)

testFilter(
	"[date.hour(my.event.date-and-time, 19)]",
	prismic.filter.dateHour("my.event.date-and-time", 19),
)

testFilter(
	"[date.hour-after(document.first_publication_date, 21)]",
	prismic.filter.dateHourAfter("document.first_publication_date", 21),
)

testFilter(
	"[date.hour-after(document.last_publication_date, 8)]",
	prismic.filter.dateHourAfter("document.last_publication_date", 8),
)

testFilter(
	"[date.hour-after(my.blog-post.releaseDate, 16)]",
	prismic.filter.dateHourAfter("my.blog-post.releaseDate", 16),
)

testFilter(
	"[date.hour-before(document.first_publication_date, 10)]",
	prismic.filter.dateHourBefore("document.first_publication_date", 10),
)

testFilter(
	"[date.hour-before(document.last_publication_date, 12)]",
	prismic.filter.dateHourBefore("document.last_publication_date", 12),
)

testFilter(
	"[date.hour-before(my.event.dateAndTime, 12)]",
	prismic.filter.dateHourBefore("my.event.dateAndTime", 12),
)
