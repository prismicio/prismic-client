import type { OptionalLinkProperties } from "../types/value/link"

/**
 * Returns optional properties only available to link fields. Link fields can
 * have the same shape as content relationship and link to media fields,
 * requiring special treatment to extract link-specific properties.
 *
 * @param input - The content relationship or link to media field from which the
 *   link properties will be extracted.
 *
 * @returns Optional link properties that `input` might have.
 */
export const getOptionalLinkProperties = (
	input: OptionalLinkProperties,
): OptionalLinkProperties => {
	const res: OptionalLinkProperties = {}

	if ("text" in input) {
		res.text = input.text
	}

	if ("variant" in input) {
		res.variant = input.variant
	}

	return res
}
