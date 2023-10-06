import { PrismicError } from "./PrismicError";

type ForbiddenErrorRepositoryAPIResponse = {
	type: string;
	message: string;
};

type ForbiddenErrorQueryAPIResponse = {
	error: string;
};

export class ForbiddenError<
	TResponse =
		| ForbiddenErrorRepositoryAPIResponse
		| ForbiddenErrorQueryAPIResponse,
> extends PrismicError<TResponse> {}
