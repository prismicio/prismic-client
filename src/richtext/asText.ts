import type { RTTextNode, RichTextField } from "../types/value/richText"

/**
 * Converts a rich text field to a plain text string.
 *
 * @param richTextField - A rich text field from Prismic.
 * @param separator - Separator used to join each element. Defaults to a space.
 *
 * @returns Plain text equivalent of the rich text field.
 *
 * @see Learn how to work with rich text fields: {@link https://prismic.io/docs/fields/rich-text}
 */
export const asText = (
	richTextField: RichTextField,
	separator = " ",
): string => {
	let result = ""

	for (let i = 0; i < richTextField.length; i++) {
		if ("text" in richTextField[i]) {
			result +=
				(result ? separator : "") + (richTextField[i] as RTTextNode).text
		}
	}

	return result
}
