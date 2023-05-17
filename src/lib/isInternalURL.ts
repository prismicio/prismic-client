/**
 * Determines if a URL is internal or external.
 *
 * @param url - The URL to check if internal or external.
 *
 * @returns `true` if `url` is internal, `false` otherwise.
 */
// TODO: This does not detect all relative URLs as internal such as `about` or `./about`. This function assumes relative URLs start with a "/" or "#"`.
export const isInternalURL = (url: string): boolean => {
	const isInternal = /^(\/(?!\/)|#)/.test(url);
	const isSpecialLink = !isInternal && !/^https?:\/\//.test(url);

	return isInternal && !isSpecialLink;
};
