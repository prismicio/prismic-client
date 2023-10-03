import { ForbiddenError } from "./ForbiddenError";

type RefExpiredErrorAPIResponse = {
	type: "api_validation_error";
	message: string;
};

// This error extends `ForbiddenError` for backwards compatibility. Before the
// API started returning 410 for expired refs, it returnd 403, which threw a
// `ForbiddenError`.
// TODO: Extend this error from `PrismicError` in v8.
export class RefExpiredError<
	TResponse = RefExpiredErrorAPIResponse,
> extends ForbiddenError<TResponse> {}
