export class PrismicError<Response> extends Error {
	url?: string;
	response: Response;

	constructor(
		message = "An invalid API response was returned",
		url: string | undefined,
		response: Response,
	) {
		super(message);

		this.url = url;
		this.response = response;
	}
}
