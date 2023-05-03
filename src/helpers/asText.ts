import { asText as baseAsText } from "@prismicio/richtext";

import { RichTextField } from "../types/value/richText";

/**
 * Configuration that determines the output of `asText()`.
 */
type AsTextConfig = {
	/**
	 * Separator used to join each element.
	 *
	 * @defaultValue ` ` (a space)
	 */
	separator?: string;
};

// TODO: Remove when we remove support for deprecated tuple-style configuration.
/**
 * @deprecated Use object-style configuration instead.
 */
type AsTextDeprecatedTupleConfig = [separator?: string];

/**
 * The return type of `asText()`.
 */
type AsTextReturnType<Field extends RichTextField | null | undefined> =
	Field extends RichTextField ? string : null;

export const asText: {
	/**
	 * Serializes a Rich Text or Title field to a plain text string.
	 *
	 * @param richTextField - A Rich Text or Title field from Prismic
	 * @param config - Configuration that determines the output of `asText()`
	 *
	 * @returns Plain text equivalent of the provided Rich Text or Title field
	 * @see Templating Rich Text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
	 */
	<Field extends RichTextField | null | undefined>(
		richTextField: Field,
		config?: AsTextConfig,
	): AsTextReturnType<Field>;

	/**
	 * Serializes a Rich Text or Title field to a plain text string.
	 *
	 * @param richTextField - A Rich Text or Title field from Prismic
	 * @param separator - Separator used to join each element, defaults to a space
	 *
	 * @returns Plain text equivalent of the provided Rich Text or Title field
	 * @see Templating Rich Text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
	 *
	 * @deprecated Use object-style configuration instead.
	 *
	 * ```ts
	 * asText(field);
	 * asText(field, { separator });
	 * ```
	 */
	<Field extends RichTextField | null | undefined>(
		richTextField: Field,
		...config: AsTextDeprecatedTupleConfig
	): AsTextReturnType<Field>;
} = <Field extends RichTextField | null | undefined>(
	richTextField: Field,
	// TODO: Rename to `config` when we remove support for deprecated tuple-style configuration.
	...configObjectOrTuple: [config?: AsTextConfig] | AsTextDeprecatedTupleConfig
): AsTextReturnType<Field> => {
	if (richTextField) {
		// TODO: Remove when we remove support for deprecated tuple-style configuration.
		const [configObjectOrSeparator] = configObjectOrTuple;
		let config: AsTextConfig;
		if (typeof configObjectOrSeparator === "string") {
			config = {
				separator: configObjectOrSeparator,
			};
		} else {
			config = { ...configObjectOrSeparator };
		}

		return baseAsText(
			richTextField,
			config.separator,
		) as AsTextReturnType<Field>;
	} else {
		return null as AsTextReturnType<Field>;
	}
};
