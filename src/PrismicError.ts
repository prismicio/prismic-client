type PrismicErrorArgs = {
	url: string;
	response?: Record<string, unknown>;
};

export class PrismicError extends Error {
	url: string;
	response?: Record<string, unknown>;

	constructor(message: string | undefined, args: PrismicErrorArgs) {
		super(message || "An invalid API response was returned");

		this.url = args.url;
		this.response = args.response;
	}
}
