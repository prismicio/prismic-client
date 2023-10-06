import { RTTextNode, RichTextField } from "../types/value/richText";

/**
 * Serializes a rich text or title field to a plain text string
 *
 * @param richTextField - A rich text or title field from Prismic
 * @param separator - Separator used to join each element, defaults to a space
 *
 * @returns Plain text equivalent of the provided rich text or title field
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export const asText = (
	richTextField: RichTextField,
	separator = " ",
): string => {
	let result = "";

	for (let i = 0; i < richTextField.length; i++) {
		if ("text" in richTextField[i]) {
			result +=
				(result ? separator : "") + (richTextField[i] as RTTextNode).text;
		}
	}

	return result;
};
