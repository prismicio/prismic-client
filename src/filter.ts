/**
 * Formats the value of a filter element to a stringified version accepted by
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
 * Creates a filter builder function for filters with a path and arguments.
 *
 * @typeParam Args - Arguments for the filter.
 *
 * @param name - Name of the filter used in the resulting string.
 *
 * @returns Filter builder function for the given name.
 */
const pathWithArgsFilter = <Args extends unknown[]>(name: string) => {
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
 * Creates a filter builder function for filters with only a path.
 *
 * @param name - Name of the filter used in the resulting string.
 *
 * @returns Filter builder function for the given name.
 */
const pathFilter = (name: string) => {
	const filterFn = pathWithArgsFilter(name);

	/**
	 * @param path - Path for the filter.
	 */
	const fn = (path: string): string => {
		return filterFn(path);
	};

	return fn;
};

/**
 * Creates a filter builder function for filters with only arguments and no
 * path.
 *
 * @param name - Name of the filter used in the resulting string.
 *
 * @returns Filter builder function for the given name.
 */
const argsFilter = <Args extends unknown[]>(name: string) => {
	const filterFn = pathWithArgsFilter<Args>(name);

	/**
	 * @param args - Arguments for the filter.
	 */
	const fn = (...args: Args): string => {
		return filterFn("", ...args);
	};

	return fn;
};

export const filter = {
	/**
	 * The `at` filter checks that the path matches the described value exactly.
	 * It takes a single value for a field or an array (only for tags).
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#at}
	 */
	at: pathWithArgsFilter<[value: string | number | boolean | Date | string[]]>(
		"at",
	),

	/**
	 * The `not` filter checks that the path doesn't match the provided value
	 * exactly. It takes a single value for a field or an array (only for tags).
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#not}
	 */
	not: pathWithArgsFilter<[value: string | number | boolean | Date | string[]]>(
		"not",
	),

	/**
	 * The `any` filter takes an array of values. It works exactly the same way as
	 * the `at` operator, but checks whether the fragment matches any of the
	 * values in the array.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#any}
	 */
	any: pathWithArgsFilter<[values: (string | number | boolean | Date)[]]>(
		"any",
	),

	/**
	 * The `in` filter is used specifically to retrieve an array of documents by
	 * their IDs or UIDs. This filter is much more efficient at this than the any
	 * filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#in}
	 */
	in: pathWithArgsFilter<[values: string[]]>("in"),

	/**
	 * The `fulltext` filter provides two capabilities:
	 *
	 * 1. Checking if a certain string is anywhere inside a document (this is what
	 *    you should use to make your project's search engine feature)
	 * 2. Checking if the string is contained inside a specific custom type’s Rich
	 *    Text or Key Text fragment.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#fulltext}
	 */
	fulltext: pathWithArgsFilter<[searchTerms: string]>("fulltext"),

	/**
	 * The `has` filter checks whether a fragment has a value. It will return all
	 * the documents of the specified type that contain a value for the specified
	 * field.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#has}
	 */
	has: pathFilter("has"),

	/**
	 * The `missing` filter checks if a fragment doesn't have a value. It will
	 * return all the documents of the specified type that do not contain a value
	 * for the specified field.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#missing}
	 */
	missing: pathFilter("missing"),

	/**
	 * The `similar` filter takes the ID of a document, and returns a list of
	 * documents with similar content. This allows you to build an automated
	 * content discovery feature (for example, a "Related posts" section).
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#similar}
	 */
	similar: argsFilter<[id: string, value: number]>("similar"),

	/**
	 * The `geopoint.near` filter checks that the value in the path is within the
	 * radius of the given coordinates.
	 *
	 * This filter will only work for a geopoint field.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#geopointnear}
	 */
	geopointNear:
		pathWithArgsFilter<[latitude: number, longitude: number, radius: number]>(
			"geopoint.near",
		),

	/**
	 * The `number.lt` filter checks that the value in the number field is less
	 * than the value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#numberlessthan}
	 */
	numberLessThan: pathWithArgsFilter<[value: number]>("number.lt"),

	/**
	 * The `number.gt` filter checks that the value in the number field is greater
	 * than the value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#numbergreaterthan}
	 */
	numberGreaterThan: pathWithArgsFilter<[value: number]>("number.gt"),

	/**
	 * The `number.inRange` filter checks that the value in the path is within the
	 * two values passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#numberinrange}
	 */
	numberInRange:
		pathWithArgsFilter<[lowerLimit: number, upperLimit: number]>(
			"number.inRange",
		),

	/**
	 * The `date.after` filter checks that the value in the path is after the date
	 * value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateAfter: pathWithArgsFilter<[date: string | number | Date]>("date.after"),

	/**
	 * The `date.before` filter checks that the value in the path is before the
	 * date value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateBefore: pathWithArgsFilter<[date: string | number | Date]>("date.before"),

	/**
	 * The `date.between` filter checks that the value in the path is within the
	 * date values passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateBetween:
		pathWithArgsFilter<
			[startDate: string | number | Date, endDate: string | number | Date]
		>("date.between"),

	/**
	 * The `date.day-of-month` filter checks that the value in the path is equal
	 * to the day of the month passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateDayOfMonth: pathWithArgsFilter<[day: number]>("date.day-of-month"),

	/**
	 * The `date.day-of-month-after` filter checks that the value in the path is
	 * after the day of the month passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateDayOfMonthAfter: pathWithArgsFilter<[day: number]>(
		"date.day-of-month-after",
	),

	/**
	 * The `date.day-of-month-before` filter checks that the value in the path is
	 * before the day of the month passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateDayOfMonthBefore: pathWithArgsFilter<[day: number]>(
		"date.day-of-month-before",
	),

	/**
	 * The `date.day-of-week` filter checks that the value in the path is equal to
	 * the day of the week passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateDayOfWeek: pathWithArgsFilter<[day: string | number]>("date.day-of-week"),

	/**
	 * The `date.day-of-week-after` filter checks that the value in the path is
	 * after the day of the week passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateDayOfWeekAfter: pathWithArgsFilter<[day: string | number]>(
		"date.day-of-week-after",
	),

	/**
	 * The date.day-of-week-before filter checks that the value in the path is
	 * before the day of the week passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateDayOfWeekBefore: pathWithArgsFilter<[day: string | number]>(
		"date.day-of-week-before",
	),

	/**
	 * The `date.month` filter checks that the value in the path occurs in the
	 * month value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateMonth: pathWithArgsFilter<[month: string | number]>("date.month"),

	/**
	 * The `date.month-after` filter checks that the value in the path occurs in
	 * any month after the value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateMonthAfter:
		pathWithArgsFilter<[month: string | number]>("date.month-after"),

	/**
	 * The `date.month-before` filter checks that the value in the path occurs in
	 * any month before the value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateMonthBefore:
		pathWithArgsFilter<[month: string | number]>("date.month-before"),

	/**
	 * The `date.year` filter checks that the value in the path occurs in the year
	 * value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateYear: pathWithArgsFilter<[year: number]>("date.year"),

	/**
	 * The `date.hour` filter checks that the value in the path occurs within the
	 * hour value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateHour: pathWithArgsFilter<[hour: number]>("date.hour"),

	/**
	 * The `date.hour-after` filter checks that the value in the path occurs after
	 * the hour value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateHourAfter: pathWithArgsFilter<[hour: number]>("date.hour-after"),

	/**
	 * The `date.hour-before` filter checks that the value in the path occurs
	 * before the hour value passed into the filter.
	 *
	 * {@link https://prismic.io/docs/rest-api-technical-reference#date-filters}
	 */
	dateHourBefore: pathWithArgsFilter<[hour: number]>("date.hour-before"),
};
