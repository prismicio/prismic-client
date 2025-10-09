import type { RichTextField } from "../types/value/richText"

import { asText as baseAsText } from "../richtext/asText"

/**
 * Configuration that determines the output of `asText()`.
 */
type AsTextConfig = {
	/**
	 * Separator used to join each element.
	 *
	 * @defaultValue ` ` (a space)
	 */
	separator?: string
}

// TODO: Remove when we remove support for deprecated tuple-style configuration.
/**
 * @deprecated Use object-style configuration instead.
 */
type AsTextDeprecatedTupleConfig = [separator?: string]

/**
 * The return type of `asText()`.
 */
type AsTextReturnType<Field extends RichTextField | null | undefined> =
	Field extends RichTextField ? string : null

export const asText: {
	/**
	 * Converts a rich text field to a plain text string.
	 *
	 * @example
	 *
	 * ```ts
	 * const text = asText(document.data.content);
	 * // => "Hello world"
	 * ```
	 *
	 * @param richTextField - A rich text field from Prismic.
	 * @param config - Configuration that determines the output of `asText()`.
	 *
	 * @returns Plain text equivalent of the rich text field, or `null` if the field is empty.
	 *
	 * @see Learn how to display rich text as plain text: {@link https://prismic.io/docs/fields/rich-text}
	 */
	<Field extends RichTextField | null | undefined>(
		richTextField: Field,
		config?: AsTextConfig,
	): AsTextReturnType<Field>

	/**
	 * Converts a rich text field to a plain text string.
	 *
	 * @deprecated Use object-style configuration instead.
	 *
	 * @param richTextField - A rich text field from Prismic.
	 * @param separator - Separator used to join each element. Defaults to a space.
	 *
	 * @returns Plain text equivalent of the rich text field, or `null` if the field is empty.
	 *
	 * @see Learn how to display rich text as plain text: {@link https://prismic.io/docs/fields/rich-text}
	 */
	<Field extends RichTextField | null | undefined>(
		richTextField: Field,
		...config: AsTextDeprecatedTupleConfig
	): AsTextReturnType<Field>
} = <Field extends RichTextField | null | undefined>(
	richTextField: Field,
	// TODO: Rename to `config` when we remove support for deprecated tuple-style configuration.
	...configObjectOrTuple: [config?: AsTextConfig] | AsTextDeprecatedTupleConfig
): AsTextReturnType<Field> => {
	if (richTextField) {
		// TODO: Remove when we remove support for deprecated tuple-style configuration.
		const [configObjectOrSeparator] = configObjectOrTuple
		let config: AsTextConfig
		if (typeof configObjectOrSeparator === "string") {
			config = {
				separator: configObjectOrSeparator,
			}
		} else {
			config = { ...configObjectOrSeparator }
		}

		return baseAsText(
			richTextField,
			config.separator,
		) as AsTextReturnType<Field>
	} else {
		return null as AsTextReturnType<Field>
	}
}
