import { asText as baseAsText } from "@prismicio/richtext";

import { RichTextField } from "../types/value/richText";

/**
 * The return type of `asText()`.
 */
type AsTextReturnType<Field extends RichTextField | null | undefined> =
	Field extends RichTextField ? string : null;

/**
 * Serializes a Rich Text or Title field to a plain text string
 *
 * @param richTextField - A Rich Text or Title field from Prismic
 * @param separator - Separator used to join each element, defaults to a space
 *
 * @returns Plain text equivalent of the provided Rich Text or Title field
 * @see Templating Rich Text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
 */
export const asText = <Field extends RichTextField | null | undefined>(
	richTextField: Field,
	separator?: string,
): AsTextReturnType<Field> => {
	if (richTextField) {
		return baseAsText(richTextField, separator) as AsTextReturnType<Field>;
	} else {
		return null as AsTextReturnType<Field>;
	}
};
