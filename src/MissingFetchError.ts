export class MissingFetchError extends Error {
	constructor(
		message = "A fetch implementation was not provided. In environments where fetch is not available (including Node.js), a fetch implementation must be provided via a polyfill or the `fetch` option."
	) {
		super(message);
	}
}
