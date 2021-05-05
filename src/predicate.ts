const formatValue = (
  value: string | number | Date | (string | number | Date)[],
): string =>
  Array.isArray(value)
    ? `[${value.map(formatValue).join(', ')}]`
    : typeof value === 'string'
    ? `"${value}"`
    : value instanceof Date
    ? `${value.getTime()}`
    : `${value}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pathWithArgsPredicate = <Args extends any[]>(name: string) =>
  /**
   * @param path Path to the value to be compared.
   */
  (path: string, ...args: Args): string =>
    `[${name}(${path}${path && args.length ? ', ' : ''}${args
      .map(formatValue)
      .join(', ')})]`

const pathPredicate = (name: string) => (path: string): string =>
  pathWithArgsPredicate(name)(path)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const argsPredicate = <Args extends any[]>(name: string) => (
  ...args: Args
): string => pathWithArgsPredicate<Args>(name)('', ...args)

type DefaultPredicateArgs = [value: string | number | (string | number)[]]

/**
 * The `at` predicate checks that the path matches the described value exactly. It takes a single value for a field or an array (only for tags).
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#at
 */
export const at = pathWithArgsPredicate<DefaultPredicateArgs>('at')

/**
 * The `not` predicate checks that the path doesn't match the provided value exactly. It takes a single value as the argument.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#not
 */
export const not = pathWithArgsPredicate<DefaultPredicateArgs>('not')

/**
 * The `any` predicate takes an array of values. It works exactly the same way as the `at` operator, but checks whether the fragment matches any of the values in the array.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#any
 */
export const any = pathWithArgsPredicate<DefaultPredicateArgs>('any')

/**
 * The `in` predicate is used specifically to retrieve an array of documents by their IDs or UIDs. This predicate is much more efficient at this than the any predicate.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#in
 */
const _in = pathWithArgsPredicate<DefaultPredicateArgs>('in')

// Named `_in` since `in` is a keyword.
export { _in as in }

/**
 * The `fulltext` predicate provides two capabilities:
 *
 * 1. Checking if a certain string is anywhere inside a document (this is what you should use to make your project's search engine feature)
 * 2. Checking if the string is contained inside a specific custom type’s Rich Text or Key Text fragment.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#fulltext
 */
export const fulltext = pathWithArgsPredicate<DefaultPredicateArgs>('fulltext')

/**
 * The `has` predicate checks whether a fragment has a value. It will return all the documents of the specified type that contain a value for the specified field.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#has
 */
export const has = pathPredicate('has')

/**
 * The `missing` predicate checks if a fragment doesn't have a value. It will return all the documents of the specified type that do not contain a value for the specified field.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#missing
 */
export const missing = pathPredicate('missing')

/**
 * The `similar` predicate takes the ID of a document, and returns a list of documents with similar content. This allows you to build an automated content discovery feature (for example, a "Related posts" section).
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#similar
 */
export const similar = argsPredicate<[id: string, value: number]>('similar')

/**
 * The `geopoint.near` predicate checks that the value in the path is within the radius of the given coordinates.
 *
 * This predicate will only work for a GeoPoint field.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#near
 */
export const geopointNear = pathWithArgsPredicate<
  [latitude: number, longitude: number, radius: number]
>('geopoint.near')

/**
 * The `number.lt` predicate checks that the value in the number field is less than the value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#lt-less-than
 */
export const numberLessThan = pathWithArgsPredicate<[value: number]>(
  'number.lt',
)

/**
 * The `number.gt` predicate checks that the value in the number field is greater than the value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#gt-greater-than
 */
export const numberGreaterThan = pathWithArgsPredicate<[value: number]>(
  'number.gt',
)

/**
 * The `number.inRange` predicate checks that the value in the path is within the two values passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/query-predicates-reference-rest-api#inrange
 */
export const numberInRange = pathWithArgsPredicate<
  [lowerLimit: number, upperLimit: number]
>('number.inRange')

/**
 * The `date.after` predicate checks that the value in the path is after the date value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#after
 */
export const dateAfter = pathWithArgsPredicate<[date: string | number | Date]>(
  'date.after',
)

/**
 * The `date.before` predicate checks that the value in the path is before the date value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#before
 */
export const dateBefore = pathWithArgsPredicate<[date: string | number | Date]>(
  'date.before',
)

/**
 * The `date.between` predicate checks that the value in the path is within the date values passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#between
 */
export const dateBetween = pathWithArgsPredicate<
  [startDate: string | number | Date, endDate: string | number | Date]
>('date.between')

/**
 * The `date.day-of-month` predicate checks that the value in the path is equal to the day of the month passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofmonth
 */
export const dateDayOfMonth = pathWithArgsPredicate<[day: number]>(
  'date.day-of-month',
)

/**
 * The `date.day-of-month-after` predicate checks that the value in the path is after the day of the month passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofmonthafter
 */
export const dateDayOfMonthAfter = pathWithArgsPredicate<[day: number]>(
  'date.day-of-month-after',
)

/**
 * The `date.day-of-month-before` predicate checks that the value in the path is before the day of the month passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofmonthbefore
 */
export const dateDayOfMonthBefore = pathWithArgsPredicate<[day: number]>(
  'date.day-of-month-before',
)

/**
 * The `date.day-of-week` predicate checks that the value in the path is equal to the day of the week passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofweek
 */
export const dateDayOfWeek = pathWithArgsPredicate<[day: string | number]>(
  'date.day-of-week',
)

/**
 * The `date.day-of-week-after` predicate checks that the value in the path is after the day of the week passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofweekafter
 */
export const dateDayOfWeekAfter = pathWithArgsPredicate<[day: string | number]>(
  'date.day-of-week-after',
)

/**
 * The date.day-of-week-before predicate checks that the value in the path is before the day of the week passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#dayofweekbefore
 */
export const dateDayOfWeekBefore = pathWithArgsPredicate<
  [day: string | number]
>('date.day-of-week-before')

/**
 * The `date.month` predicate checks that the value in the path occurs in the month value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#month
 */
export const dateMonth = pathWithArgsPredicate<[month: string | number]>(
  'date.month',
)

/**
 * The `date.month-after` predicate checks that the value in the path occurs in any month after the value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#monthafter
 */
export const dateMonthAfter = pathWithArgsPredicate<[month: string | number]>(
  'date.month-after',
)

/**
 * The `date.month-before` predicate checks that the value in the path occurs in any month before the value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#monthbefore
 */
export const dateMonthBefore = pathWithArgsPredicate<[month: string | number]>(
  'date.month-before',
)

/**
 * The `date.year` predicate checks that the value in the path occurs in the year value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#year
 */
export const dateYear = pathWithArgsPredicate<[year: number]>('date.year')

/**
 * The `date.hour` predicate checks that the value in the path occurs within the hour value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#hour
 */
export const dateHour = pathWithArgsPredicate<[hour: number]>('date.hour')

/**
 * The `date.hour-after` predicate checks that the value in the path occurs after the hour value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#hourafter
 */
export const dateHourAfter = pathWithArgsPredicate<[hour: number]>(
  'date.hour-after',
)

/**
 * The `date.hour-before` predicate checks that the value in the path occurs before the hour value passed into the predicate.
 *
 * @see https://prismic.io/docs/technologies/date-and-time-based-predicate-reference-rest-api#hourbefore
 */
export const dateHourBefore = pathWithArgsPredicate<[hour: number]>(
  'date.hour-before',
)
