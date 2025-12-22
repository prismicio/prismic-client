import { describe } from "vitest"

import { it } from "./it"

import { filter } from "../src"

describe("any", () => {
	it("supports strings", async ({ expect }) => {
		const res = filter.any("document.type", ["product", "blog-post"])
		expect(res).toBe('[any(document.type, ["product", "blog-post"])]')
	})

	it("supports booleans", async ({ expect }) => {
		const res = filter.any("my.product.out_of_stock", [true, false])
		expect(res).toBe("[any(my.product.out_of_stock, [true, false])]")
	})

	it("supports dates", async ({ expect }) => {
		const res = filter.any("my.product.restock_date", [
			new Date(1600000000000),
			new Date(1700000000000),
		])
		expect(res).toBe(
			"[any(my.product.restock_date, [1600000000000, 1700000000000])]",
		)
	})

	it("supports quotation marks", async ({ expect }) => {
		const res = filter.any("my.product.description", ['"quote"'])
		expect(res).toBe('[any(my.product.description, ["\\"quote\\""])]')
	})
})

describe("at", () => {
	it("supports string", async ({ expect }) => {
		const res = filter.at("document.type", "product")
		expect(res).toBe('[at(document.type, "product")]')
	})

	it("supports arrays", async ({ expect }) => {
		const res = filter.at("document.tags", ["Macaron", "Cupcake"])
		expect(res).toBe('[at(document.tags, ["Macaron", "Cupcake"])]')
	})

	it("supports numbers", async ({ expect }) => {
		const res = filter.at("my.product.price", 50)
		expect(res).toBe("[at(my.product.price, 50)]")
	})

	it("supports booleans", async ({ expect }) => {
		const res = filter.at("my.product.out_of_stock", true)
		expect(res).toBe("[at(my.product.out_of_stock, true)]")
	})

	it("supports dates", async ({ expect }) => {
		const res = filter.at("my.product.restock_date", new Date(1600000000000))
		expect(res).toBe("[at(my.product.restock_date, 1600000000000)]")
	})

	it("supports quotation marks", async ({ expect }) => {
		const res = filter.at("my.product.description", '"quote"')
		expect(res).toBe('[at(my.product.description, "\\"quote\\"")]')
	})
})

describe("dateAfter", () => {
	it("supports ISO dates", async ({ expect }) => {
		const res = filter.dateAfter(
			"document.first_publication_date",
			"2017-05-18T17:00:00-0500",
		)
		expect(res).toBe(
			'[date.after(document.first_publication_date, "2017-05-18T17:00:00-0500")]',
		)
	})

	it("supports timestamps", async ({ expect }) => {
		const res = filter.dateAfter(
			"document.last_publication_date",
			1495080000000,
		)
		expect(res).toBe(
			"[date.after(document.last_publication_date, 1495080000000)]",
		)
	})

	it("supports date strings", async ({ expect }) => {
		const res = filter.dateAfter("my.article.release-date", "2017-01-22")
		expect(res).toBe('[date.after(my.article.release-date, "2017-01-22")]')
	})

	it("supports Date objects", async ({ expect }) => {
		const res = filter.dateAfter(
			"my.article.release-date",
			Date.parse("2017-01-22"),
		)
		expect(res).toBe("[date.after(my.article.release-date, 1485043200000)]")
	})
})

describe("dateBefore", () => {
	it("supports ISO dates", async ({ expect }) => {
		const res = filter.dateBefore(
			"document.first_publication_date",
			"2016-09-19T14:00:00-0400",
		)
		expect(res).toBe(
			'[date.before(document.first_publication_date, "2016-09-19T14:00:00-0400")]',
		)
	})

	it("supports timestamps", async ({ expect }) => {
		const res = filter.dateBefore(
			"document.last_publication_date",
			1476504000000,
		)
		expect(res).toBe(
			"[date.before(document.last_publication_date, 1476504000000)]",
		)
	})

	it("supports date strings", async ({ expect }) => {
		const res = filter.dateBefore("my.post.date", "2017-02-24")
		expect(res).toBe('[date.before(my.post.date, "2017-02-24")]')
	})

	it("supports Date objects", async ({ expect }) => {
		const res = filter.dateBefore("my.post.date", Date.parse("2017-02-24"))
		expect(res).toBe("[date.before(my.post.date, 1487894400000)]")
	})
})

describe("dateBetween", () => {
	it("supports date strings", async ({ expect }) => {
		const res = filter.dateBetween(
			"document.first_publication_date",
			"2017-01-16",
			"2017-01-20",
		)
		expect(res).toBe(
			'[date.between(document.first_publication_date, "2017-01-16", "2017-01-20")]',
		)
	})

	it("supports ISO dates", async ({ expect }) => {
		const res = filter.dateBetween(
			"document.last_publication_date",
			"2016-09-15T05:30:00+0100",
			"2017-10-15T11:45:00+0100",
		)
		expect(res).toBe(
			'[date.between(document.last_publication_date, "2016-09-15T05:30:00+0100", "2017-10-15T11:45:00+0100")]',
		)
	})

	it("supports timestamps", async ({ expect }) => {
		const res = filter.dateBetween(
			"my.query-fields.date",
			1483074000000,
			1483333200000,
		)
		expect(res).toBe(
			"[date.between(my.query-fields.date, 1483074000000, 1483333200000)]",
		)
	})

	it("supports Date objects", async ({ expect }) => {
		const res = filter.dateBetween(
			"my.query-fields.date",
			new Date(1583074000000),
			new Date(1583333200000),
		)
		expect(res).toBe(
			"[date.between(my.query-fields.date, 1583074000000, 1583333200000)]",
		)
	})
})

describe("dateDayOfMonth", () => {
	it("supports day number", async ({ expect }) => {
		const res = filter.dateDayOfMonth("document.first_publication_date", 22)
		expect(res).toBe("[date.day-of-month(document.first_publication_date, 22)]")
	})
})

describe("dateDayOfMonthAfter", () => {
	it("supports day number", async ({ expect }) => {
		const res = filter.dateDayOfMonthAfter(
			"document.first_publication_date",
			22,
		)
		expect(res).toBe(
			"[date.day-of-month-after(document.first_publication_date, 22)]",
		)
	})
})

describe("dateDayOfMonthBefore", () => {
	it("supports day number", async ({ expect }) => {
		const res = filter.dateDayOfMonthBefore(
			"document.first_publication_date",
			20,
		)
		expect(res).toBe(
			"[date.day-of-month-before(document.first_publication_date, 20)]",
		)
	})
})

describe("dateDayOfWeek", () => {
	it("supports string names", async ({ expect }) => {
		const res = filter.dateDayOfWeek(
			"document.first_publication_date",
			"monday",
		)
		expect(res).toBe(
			'[date.day-of-week(document.first_publication_date, "monday")]',
		)
	})

	it("supports abbreviated names", async ({ expect }) => {
		const res = filter.dateDayOfWeek("document.last_publication_date", "sun")
		expect(res).toBe(
			'[date.day-of-week(document.last_publication_date, "sun")]',
		)
	})

	it("supports day numbers", async ({ expect }) => {
		const res = filter.dateDayOfWeek("my.concert.show-date", 5)
		expect(res).toBe("[date.day-of-week(my.concert.show-date, 5)]")
	})
})

describe("dateDayOfWeekAfter", () => {
	it("supports string names", async ({ expect }) => {
		const res = filter.dateDayOfWeekAfter(
			"document.first_publication_date",
			"fri",
		)
		expect(res).toBe(
			'[date.day-of-week-after(document.first_publication_date, "fri")]',
		)
	})

	it("supports day numbers", async ({ expect }) => {
		const res = filter.dateDayOfWeekAfter("my.blog-post.date", 2)
		expect(res).toBe("[date.day-of-week-after(my.blog-post.date, 2)]")
	})
})

describe("dateDayOfWeekBefore", () => {
	it("supports string names", async ({ expect }) => {
		const res = filter.dateDayOfWeekBefore(
			"document.first_publication_date",
			"Wed",
		)
		expect(res).toBe(
			'[date.day-of-week-before(document.first_publication_date, "Wed")]',
		)
	})

	it("supports day numbers", async ({ expect }) => {
		const res = filter.dateDayOfWeekBefore("my.page.release-date", 6)
		expect(res).toBe("[date.day-of-week-before(my.page.release-date, 6)]")
	})
})

describe("dateMonth", () => {
	it("supports month names", async ({ expect }) => {
		const res = filter.dateMonth("document.first_publication_date", "august")
		expect(res).toBe('[date.month(document.first_publication_date, "august")]')
	})

	it("supports month numbers", async ({ expect }) => {
		const res = filter.dateMonth("my.blog-post.date", 1)
		expect(res).toBe("[date.month(my.blog-post.date, 1)]")
	})
})

describe("dateMonthAfter", () => {
	it("supports month names", async ({ expect }) => {
		const res = filter.dateMonthAfter(
			"document.first_publication_date",
			"February",
		)
		expect(res).toBe(
			'[date.month-after(document.first_publication_date, "February")]',
		)
	})

	it("supports month numbers", async ({ expect }) => {
		const res = filter.dateMonthAfter("document.last_publication_date", 6)
		expect(res).toBe("[date.month-after(document.last_publication_date, 6)]")
	})
})

describe("dateMonthBefore", () => {
	it("supports month numbers", async ({ expect }) => {
		const res = filter.dateMonthBefore("document.first_publication_date", 8)
		expect(res).toBe("[date.month-before(document.first_publication_date, 8)]")
	})

	it("supports month names", async ({ expect }) => {
		const res = filter.dateMonthBefore("document.last_publication_date", "june")
		expect(res).toBe(
			'[date.month-before(document.last_publication_date, "june")]',
		)
	})
})

describe("dateYear", () => {
	it("supports year number", async ({ expect }) => {
		const res = filter.dateYear("document.first_publication_date", 2016)
		expect(res).toBe("[date.year(document.first_publication_date, 2016)]")
	})
})

describe("dateHour", () => {
	it("supports hour number", async ({ expect }) => {
		const res = filter.dateHour("document.first_publication_date", 12)
		expect(res).toBe("[date.hour(document.first_publication_date, 12)]")
	})
})

describe("dateHourAfter", () => {
	it("supports hour number", async ({ expect }) => {
		const res = filter.dateHourAfter("document.first_publication_date", 21)
		expect(res).toBe("[date.hour-after(document.first_publication_date, 21)]")
	})
})

describe("dateHourBefore", () => {
	it("supports hour number", async ({ expect }) => {
		const res = filter.dateHourBefore("document.first_publication_date", 10)
		expect(res).toBe("[date.hour-before(document.first_publication_date, 10)]")
	})
})

describe("fulltext", () => {
	it("supports single word", async ({ expect }) => {
		const res = filter.fulltext("document", "banana")
		expect(res).toBe('[fulltext(document, "banana")]')
	})

	it("supports phrases", async ({ expect }) => {
		const res = filter.fulltext("document", "banana apple")
		expect(res).toBe('[fulltext(document, "banana apple")]')
	})

	it("supports custom fields", async ({ expect }) => {
		const res = filter.fulltext("my.product.title", "phone")
		expect(res).toBe('[fulltext(my.product.title, "phone")]')
	})

	it("supports quotation marks", async ({ expect }) => {
		const res = filter.fulltext("my.product.description", '"quote"')
		expect(res).toBe('[fulltext(my.product.description, "\\"quote\\"")]')
	})
})

describe("geopointNear", () => {
	it("supports coordinates", async ({ expect }) => {
		const res = filter.geopointNear(
			"my.restaurant.location",
			9.656896299,
			-9.77508544,
			10,
		)
		expect(res).toBe(
			"[geopoint.near(my.restaurant.location, 9.656896299, -9.77508544, 10)]",
		)
	})
})

describe("has", () => {
	it("returns filter string", async ({ expect }) => {
		const res = filter.has("my.product.price")
		expect(res).toBe("[has(my.product.price)]")
	})
})

describe("in", () => {
	it("supports string ids", async ({ expect }) => {
		const res = filter.in("document.id", [
			"V9rIvCQAAB0ACq6y",
			"V9ZtvCcAALuRUzmO",
		])
		expect(res).toBe(
			'[in(document.id, ["V9rIvCQAAB0ACq6y", "V9ZtvCcAALuRUzmO"])]',
		)
	})

	it("supports uids", async ({ expect }) => {
		const res = filter.in("my.page.uid", ["myuid1", "myuid2"])
		expect(res).toBe('[in(my.page.uid, ["myuid1", "myuid2"])]')
	})
})

describe("missing", () => {
	it("returns filter string", async ({ expect }) => {
		const res = filter.missing("my.product.price")
		expect(res).toBe("[missing(my.product.price)]")
	})
})

describe("not", () => {
	it("supports strings", async ({ expect }) => {
		const res = filter.not("document.type", "product")
		expect(res).toBe('[not(document.type, "product")]')
	})

	it("supports arrays", async ({ expect }) => {
		const res = filter.not("document.tags", ["Macaron", "Cupcake"])
		expect(res).toBe('[not(document.tags, ["Macaron", "Cupcake"])]')
	})

	it("supports numbers", async ({ expect }) => {
		const res = filter.not("my.product.price", 50)
		expect(res).toBe("[not(my.product.price, 50)]")
	})

	it("supports booleans", async ({ expect }) => {
		const res = filter.not("my.product.out_of_stock", true)
		expect(res).toBe("[not(my.product.out_of_stock, true)]")
	})

	it("supports dates", async ({ expect }) => {
		const res = filter.not("my.product.restock_date", new Date(1600000000000))
		expect(res).toBe("[not(my.product.restock_date, 1600000000000)]")
	})

	it("supports quotation marks", async ({ expect }) => {
		const res = filter.not("my.product.description", '"quote"')
		expect(res).toBe('[not(my.product.description, "\\"quote\\"")]')
	})
})

describe("numberGreaterThan", () => {
	it("supports integers", async ({ expect }) => {
		const res = filter.numberGreaterThan("my.rental.numberOfBedrooms", 2)
		expect(res).toBe("[number.gt(my.rental.numberOfBedrooms, 2)]")
	})

	it("supports decimals", async ({ expect }) => {
		const res = filter.numberGreaterThan("my.product.price", 9.99)
		expect(res).toBe("[number.gt(my.product.price, 9.99)]")
	})
})

describe("numberInRange", () => {
	it("supports integer range", async ({ expect }) => {
		const res = filter.numberInRange("my.album.track-count", 7, 10)
		expect(res).toBe("[number.inRange(my.album.track-count, 7, 10)]")
	})

	it("supports decimal range", async ({ expect }) => {
		const res = filter.numberInRange("my.product.price", 9.99, 49.99)
		expect(res).toBe("[number.inRange(my.product.price, 9.99, 49.99)]")
	})
})

describe("numberLessThan", () => {
	it("supports integers", async ({ expect }) => {
		const res = filter.numberLessThan("my.instructions.numberOfSteps", 10)
		expect(res).toBe("[number.lt(my.instructions.numberOfSteps, 10)]")
	})

	it("supports decimals", async ({ expect }) => {
		const res = filter.numberLessThan("my.product.price", 49.99)
		expect(res).toBe("[number.lt(my.product.price, 49.99)]")
	})
})

describe("similar", () => {
	it("returns filter string", async ({ expect }) => {
		const res = filter.similar("VkRmhykAAFA6PoBj", 10)
		expect(res).toBe('[similar("VkRmhykAAFA6PoBj", 10)]')
	})
})
