/* eslint-disable @typescript-eslint/no-unused-vars */
// Imports for @link references:
import type { getPreviewCookie } from "./getPreviewCookie";

/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Returns whether or not a preview cookie represents an active one.
 *
 * @param cookie - The preview cookie value from {@link getPreviewCookie}
 *
 * @returns Whether or not the preview cookie represents an active previe.
 */
export const isActivePreviewCookie = (cookie: string): boolean => {
	// An active cookie looks like this (URL encoded):
	// 	{
	// 		"_tracker": "abc123",
	// 		"example-prismic-repo.prismic.io": {
	// 			preview: "https://example-prismic-repo.prismic.io/previews/abc:123?websitePreviewId=xyz"
	// 		}
	// 	}
	return /\.prismic\.io/.test(cookie);
};
