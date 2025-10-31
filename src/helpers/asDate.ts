import type { DateField } from "../types/value/date"
import type { TimestampField } from "../types/value/timestamp"

/**
 * The return type of `asDate()`.
 */
type AsDateReturnType<
	Field extends DateField | TimestampField | null | undefined,
> = Field extends DateField<"filled"> | TimestampField<"filled"> ? Date : null

/**
 * Converts a date or timestamp field to a JavaScript Date object.
 *
 * @example
 *
 * ```ts
 * const date = asDate(document.data.release_date)
 * // => Date object or null
 * ```
 *
 * @param dateOrTimestampField - A date or timestamp field from Prismic.
 *
 * @returns A Date object, or `null` if the field is empty.
 *
 * @see Learn about date and timestamp fields: {@link https://prismic.io/docs/fields/date}
 */
export const asDate = <
	Field extends DateField | TimestampField | null | undefined,
>(
	dateOrTimestampField: Field,
): AsDateReturnType<Field> => {
	if (!dateOrTimestampField) {
		return null as AsDateReturnType<Field>
	}

	// If field is a timestamp field...
	if (dateOrTimestampField.length === 24) {
		/**
		 * Converts basic ISO 8601 to ECMAScript simplified ISO 8601 format for
		 * browser compatibility issues
		 *
		 * From: YYYY-MM-DDTHH:mm:ssZ To: YYYY-MM-DDTHH:mm:ss.sssZ
		 *
		 * @see MDN documentation: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#timestamp_string}
		 * @see ECMAScript 2020 language specification: {@link https://262.ecma-international.org/11.0/#sec-date-time-string-format}
		 * @see Related forum issue: {@link https://community.prismic.io/t/prismics-date-api/2520}
		 * @see Regex101 expression: {@link https://regex101.com/r/jxyETT/1}
		 */
		return new Date(
			dateOrTimestampField.replace(/(\+|-)(\d{2})(\d{2})$/, ".000$1$2:$3"),
		) as AsDateReturnType<Field>
	} else {
		// ...else field is a date field
		return new Date(dateOrTimestampField) as AsDateReturnType<Field>
	}
}
