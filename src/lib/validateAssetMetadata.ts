import { PrismicError } from "../errors/PrismicError"

import type { CreateAssetParams } from "../WriteClient"

/**
 * Max length for asset notes accepted by the API.
 */
const ASSET_NOTES_MAX_LENGTH = 500

/**
 * Max length for asset credits accepted by the API.
 */
const ASSET_CREDITS_MAX_LENGTH = 500

/**
 * Max length for asset alt text accepted by the API.
 */
const ASSET_ALT_MAX_LENGTH = 500

/**
 * Min length for asset tags accepted by the API.
 */
const ASSET_TAG_MIN_LENGTH = 3

/**
 * Max length for asset tags accepted by the API.
 */
const ASSET_TAG_MAX_LENGTH = 20

/**
 * Validates an asset's metadata, throwing an error if any of the metadata are
 * invalid.
 *
 * @param assetMetadata - The asset metadata to validate.
 *
 * @internal
 */
export const validateAssetMetadata = ({
	notes,
	credits,
	alt,
	tags,
}: CreateAssetParams): void => {
	const errors: string[] = []

	if (notes && notes.length > ASSET_NOTES_MAX_LENGTH) {
		errors.push(
			`\`notes\` must be at most ${ASSET_NOTES_MAX_LENGTH} characters`,
		)
	}

	if (credits && credits.length > ASSET_CREDITS_MAX_LENGTH) {
		errors.push(
			`\`credits\` must be at most ${ASSET_CREDITS_MAX_LENGTH} characters`,
		)
	}

	if (alt && alt.length > ASSET_ALT_MAX_LENGTH) {
		errors.push(`\`alt\` must be at most ${ASSET_ALT_MAX_LENGTH} characters`)
	}

	if (
		tags &&
		tags.length &&
		tags.some(
			(tag) =>
				tag.length < ASSET_TAG_MIN_LENGTH || tag.length > ASSET_TAG_MAX_LENGTH,
		)
	) {
		errors.push(
			`tags must be at least 3 characters long and 20 characters at most`,
		)
	}

	if (errors.length) {
		throw new PrismicError(
			`Errors validating asset metadata: ${errors.join(", ")}`,
			undefined,
			{ notes, credits, alt, tags },
		)
	}
}
