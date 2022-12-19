/**
 * Formats the value of a predicate element to a stringified version accepted by
 * the Prismic REST API.
 *
 * @param value - Value to format.
 *
 * @returns `value` formatted for the Prismic REST API.
 */
const formatValue = (
	value:
		| string
		| number
		| Date
		| unknown
		| (string | number | Date | unknown)[],
): string => {
	if (Array.isArray(value)) {
		return `[${value.map(formatValue).join(", ")}]`;
	}

	if (typeof value === "string") {
		return `"${value}"`;
	}

	if (value instanceof Date) {
		return `${value.getTime()}`;
	}

	return `${value}`;
};

/**
 * Creates a predicate builder function for predicates with a path and
 * arguments.
 *
 * @typeParam Args - Arguments for the predicate.
 * @param name - Name of the predicate used in the resulting string.
 *
 * @returns Predicate builder function for the given name.
 */
const pathWithArgsPredicate = <Args extends unknown[]>(name: string) => {
	/**
	 * @param path - Path to the value to be compared.
	 */
	const fn = (path: string, ...args: Args): string => {
		const formattedArgs = args.map(formatValue).join(", ");
		const joiner = path && args.length ? ", " : "";

		return `[${name}(${path}${joiner}${formattedArgs})]`;
	};

	return fn;
};

/**
 * Creates a predicate builder function for predicates with only a path.
 *
 * @param name - Name of the predicate used in the resulting string.
 *
 * @returns Predicate builder function for the given name.
 */
const pathPredicate = (name: string) => {
	const predicateFn = pathWithArgsPredicate(name);

	/**
	 * @param path - Path for the predicate.
	 */
	const fn = (path: string): string => {
		return predicateFn(path);
	};

	return fn;
};

/**
 * Creates a predicate builder function for predicates with only arguments and
 * no path.
 *
 * @param name - Name of the predicate used in the resulting string.
 *
 * @returns Predicate builder function for the given name.
 */
const argsPredicate = <Args extends unknown[]>(name: string) => {
	const predicateFn = pathWithArgsPredicate<Args>(name);

	/**
	 * @param args - Arguments for the predicate.
	 */
	const fn = (...args: Args): string => {
		return predicateFn("", ...args);
	};

	return fn;
};

export const predicate = {
	/**
	 * The `at` predicate checks that the path matches the described value
	 * exactly. It takes a single value for a field or an array (only for tags).
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#at}
	 */
	at: pathWithArgsPredicate<
		[value: string | number | boolean | Date | string[]]
	>("at"),

	/**
	 * The `not` predicate checks that the path doesn't match the provided value
	 * exactly. It takes a single value for a field or an array (only for tags).
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#not}
	 */
	not: pathWithArgsPredicate<
		[value: string | number | boolean | Date | string[]]
	>("not"),

	/**
	 * The `any` predicate takes an array of values. It works exactly the same way
	 * as the `at` operator, but checks whether the fragment matches any of the
	 * values in the array.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#any}
	 */
	any: pathWithArgsPredicate<[values: (string | number | boolean | Date)[]]>(
		"any",
	),

	/**
	 * The `in` predicate is used specifically to retrieve an array of documents
	 * by their IDs or UIDs. This predicate is much more efficient at this than
	 * the any predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#in}
	 */
	in: pathWithArgsPredicate<[values: string[]]>("in"),

	/**
	 * The `fulltext` predicate provides two capabilities:
	 *
	 * 1. Checking if a certain string is anywhere inside a document (this is what
	 *    you should use to make your project's search engine feature)
	 * 2. Checking if the string is contained inside a specific custom type’s Rich
	 *    Text or Key Text fragment.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#fulltext}
	 */
	fulltext: pathWithArgsPredicate<[searchTerms: string]>("fulltext"),

	/**
	 * The `has` predicate checks whether a fragment has a value. It will return
	 * all the documents of the specified type that contain a value for the
	 * specified field.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#has}
	 */
	has: pathPredicate("has"),

	/**
	 * The `missing` predicate checks if a fragment doesn't have a value. It will
	 * return all the documents of the specified type that do not contain a value
	 * for the specified field.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#missing}
	 */
	missing: pathPredicate("missing"),

	/**
	 * The `similar` predicate takes the ID of a document, and returns a list of
	 * documents with similar content. This allows you to build an automated
	 * content discovery feature (for example, a "Related posts" section).
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#similar}
	 */
	similar: argsPredicate<[id: string, value: number]>("similar"),

	/**
	 * The `geopoint.near` predicate checks that the value in the path is within
	 * the radius of the given coordinates.
	 *
	 * This predicate will only work for a GeoPoint field.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#near}
	 */
	geopointNear:
		pathWithArgsPredicate<
			[latitude: number, longitude: number, radius: number]
		>("geopoint.near"),

	/**
	 * The `number.lt` predicate checks that the value in the number field is less
	 * than the value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#lt-less-than}
	 */
	numberLessThan: pathWithArgsPredicate<[value: number]>("number.lt"),

	/**
	 * The `number.gt` predicate checks that the value in the number field is
	 * greater than the value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#gt-greater-than}
	 */
	numberGreaterThan: pathWithArgsPredicate<[value: number]>("number.gt"),

	/**
	 * The `number.inRange` predicate checks that the value in the path is within
	 * the two values passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/query-predicates-reference-rest-api#inrange}
	 */
	numberInRange:
		pathWithArgsPredicate<[lowerLimit: number, upperLimit: number]>(
			"number.inRange",
		),

	/**
	 * The `date.after` predicate checks that the value in the path is after the
	 * date value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#after}
	 */
	dateAfter:
		pathWithArgsPredicate<[date: string | number | Date]>("date.after"),

	/**
	 * The `date.before` predicate checks that the value in the path is before the
	 * date value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#before}
	 */
	dateBefore:
		pathWithArgsPredicate<[date: string | number | Date]>("date.before"),

	/**
	 * The `date.between` predicate checks that the value in the path is within
	 * the date values passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#between}
	 */
	dateBetween:
		pathWithArgsPredicate<
			[startDate: string | number | Date, endDate: string | number | Date]
		>("date.between"),

	/**
	 * The `date.day-of-month` predicate checks that the value in the path is
	 * equal to the day of the month passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofmonth}
	 */
	dateDayOfMonth: pathWithArgsPredicate<[day: number]>("date.day-of-month"),

	/**
	 * The `date.day-of-month-after` predicate checks that the value in the path
	 * is after the day of the month passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofmonthafter}
	 */
	dateDayOfMonthAfter: pathWithArgsPredicate<[day: number]>(
		"date.day-of-month-after",
	),

	/**
	 * The `date.day-of-month-before` predicate checks that the value in the path
	 * is before the day of the month passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofmonthbefore}
	 */
	dateDayOfMonthBefore: pathWithArgsPredicate<[day: number]>(
		"date.day-of-month-before",
	),

	/**
	 * The `date.day-of-week` predicate checks that the value in the path is equal
	 * to the day of the week passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofweek}
	 */
	dateDayOfWeek:
		pathWithArgsPredicate<[day: string | number]>("date.day-of-week"),

	/**
	 * The `date.day-of-week-after` predicate checks that the value in the path is
	 * after the day of the week passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofweekafter}
	 */
	dateDayOfWeekAfter: pathWithArgsPredicate<[day: string | number]>(
		"date.day-of-week-after",
	),

	/**
	 * The date.day-of-week-before predicate checks that the value in the path is
	 * before the day of the week passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofweekbefore}
	 */
	dateDayOfWeekBefore: pathWithArgsPredicate<[day: string | number]>(
		"date.day-of-week-before",
	),

	/**
	 * The `date.month` predicate checks that the value in the path occurs in the
	 * month value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#month}
	 */
	dateMonth: pathWithArgsPredicate<[month: string | number]>("date.month"),

	/**
	 * The `date.month-after` predicate checks that the value in the path occurs
	 * in any month after the value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#monthafter}
	 */
	dateMonthAfter:
		pathWithArgsPredicate<[month: string | number]>("date.month-after"),

	/**
	 * The `date.month-before` predicate checks that the value in the path occurs
	 * in any month before the value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#monthbefore}
	 */
	dateMonthBefore:
		pathWithArgsPredicate<[month: string | number]>("date.month-before"),

	/**
	 * The `date.year` predicate checks that the value in the path occurs in the
	 * year value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#year}
	 */
	dateYear: pathWithArgsPredicate<[year: number]>("date.year"),

	/**
	 * The `date.hour` predicate checks that the value in the path occurs within
	 * the hour value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#hour}
	 */
	dateHour: pathWithArgsPredicate<[hour: number]>("date.hour"),

	/**
	 * The `date.hour-after` predicate checks that the value in the path occurs
	 * after the hour value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#hourafter}
	 */
	dateHourAfter: pathWithArgsPredicate<[hour: number]>("date.hour-after"),

	/**
	 * The `date.hour-before` predicate checks that the value in the path occurs
	 * before the hour value passed into the predicate.
	 *
	 * {@link https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#hourbefore}
	 */
	dateHourBefore: pathWithArgsPredicate<[hour: number]>("date.hour-before"),
};
