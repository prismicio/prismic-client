interface ForbiddenErrorRepositoryAPIResponse {
	type: string;
	message: string;
	oauth_initiate: string;
	oauth_token: string;
}

interface ForbiddenErrorQueryAPIResponse {
	error: string;
	oauth_initiate: string;
	oauth_token: string;
}

type ForbiddenErrorAPIResponse =
	| ForbiddenErrorRepositoryAPIResponse
	| ForbiddenErrorQueryAPIResponse;

export const isForbiddenErrorAPIResponse = (
	input: unknown
): input is ForbiddenErrorAPIResponse => {
	return (
		typeof input === "object" &&
		input !== null &&
		("error" in input || "message" in input) &&
		"oauth_initiate" in input &&
		"oauth_token" in input
	);
};

type ForbiddenErrorArgs = {
	url: string;
	response: ForbiddenErrorAPIResponse;
};

export class ForbiddenError extends Error {
	url: string;
	oauth_initiate: string;
	oauth_token: string;

	constructor(message: string, args: ForbiddenErrorArgs) {
		super(message);

		this.url = args.url;
		this.oauth_initiate = args.response.oauth_initiate;
		this.oauth_token = args.response.oauth_token;
	}
}
