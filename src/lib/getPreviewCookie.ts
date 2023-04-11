import { preview as previewCookieName } from "../cookie";

const readValue = (value: string): string => {
	return value.replace(/%3B/g, ";");
};

/**
 * Returns the value of a cookie from a given cookie store.
 *
 * @param cookieJar - The stringified cookie store from which to read the
 *   cookie.
 *
 * @returns The value of the cookie, if it exists.
 */
export const getPreviewCookie = (cookieJar: string): string | undefined => {
	const cookies = cookieJar.split("; ");

	let value: string | undefined;

	for (const cookie of cookies) {
		const parts = cookie.split("=");
		const name = readValue(parts[0]).replace(/%3D/g, "=");

		if (name === previewCookieName) {
			value = readValue(parts.slice(1).join("="));
			break;
		}
	}

	return value;
};
