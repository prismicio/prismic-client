import { PrismicError } from "./PrismicError";

type ForbiddenErrorRepositoryAPIResponse = {
	type: string;
	message: string;
};

type ForbiddenErrorQueryAPIResponse = {
	error: string;
};

type ForbiddenErrorArgs = {
	url: string;
	response:
		| ForbiddenErrorRepositoryAPIResponse
		| ForbiddenErrorQueryAPIResponse;
};

export class ForbiddenError extends PrismicError {
	response:
		| ForbiddenErrorRepositoryAPIResponse
		| ForbiddenErrorQueryAPIResponse;

	constructor(message: string, args: ForbiddenErrorArgs) {
		super(message, args);

		this.response = args.response;
	}
}
