import * as msw from "msw";

// TODO: Restore when Authorization header support works in browsers with CORS.
// import { createAuthorizationHeader } from "./createAuthorizationHeader";

export const isValidAccessToken = (
	accessToken: string | undefined,
	req: msw.RestRequest,
): boolean => {
	// TODO: Restore when Authorization header support works in browsers with CORS.
	// return typeof accessToken === "string"
	// 	? req.headers.get("Authorization") ===
	// 			createAuthorizationHeader(accessToken)
	// 	: true;

	return typeof accessToken === "string"
		? req.url.searchParams.get("access_token") === accessToken
		: true;
};
