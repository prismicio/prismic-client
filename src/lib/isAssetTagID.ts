/**
 * Checks if a string is an asset tag ID.
 *
 * @param maybeAssetTagID - A string that's maybe an asset tag ID.
 *
 * @returns `true` if the string is an asset tag ID, `false` otherwise.
 */
export const isAssetTagID = (maybeAssetTagID: string): boolean => {
	// Taken from @sinclair/typebox which is the uuid type checker of the Asset API
	// See: https://github.com/sinclairzx81/typebox/blob/e36f5658e3a56d8c32a711aa616ec8bb34ca14b4/test/runtime/compiler/validate.ts#L15
	// Tag is already a tag ID
	return /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
		maybeAssetTagID,
	)
}
