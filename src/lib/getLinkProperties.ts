import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { OptionalLinkProperties } from "../types/value/link"
import type { FilledLinkToMediaField } from "../types/value/linkToMedia"

/**
 * Returns optional properties only available to link fields. Link fields can
 * have the same shape as content relationship and link to media fields,
 * requiring special treatment to extract link-specific properties.
 *
 * @param input - The content relationship or link to media field from which the
 *   link properties are extracted.
 *
 * @returns Optional link properties that `input` might have.
 */
export const getOptionalLinkProperties = (
	input: FilledContentRelationshipField | FilledLinkToMediaField,
): OptionalLinkProperties => {
	const res: OptionalLinkProperties = {}

	if ("text" in input) {
		res.text = input.text
	}

	return res
}
