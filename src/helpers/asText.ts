import { asText as baseAsText } from "@prismicio/richtext";

import { RichTextField } from "../types/value/richText";

/**
 * The return type of `asText()`.
 */
type AsTextReturnType<Field extends RichTextField | null | undefined> =
	Field extends RichTextField ? string : null;

/**
 * Serializes a rich text or title field to a plain text string
 *
 * @param richTextField - A rich text or title field from Prismic
 * @param separator - Separator used to join each element, defaults to a space
 *
 * @returns Plain text equivalent of the provided rich text or title field
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
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
