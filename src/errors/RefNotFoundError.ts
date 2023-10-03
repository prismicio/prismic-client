import { ForbiddenError } from "./ForbiddenError";

type RefNotFoundErrorAPIResponse = {
	type: "api_notfound_error";
	message: string;
};

// This error extends `ForbiddenError` for backwards compatibility. Before the
// API started returning 404 for not found refs, it returnd 403, which threw a
// `ForbiddenError`.
// TODO: Extend this error from `PrismicError` in v8.
export class RefNotFoundError<
	TResponse = RefNotFoundErrorAPIResponse,
> extends ForbiddenError<TResponse> {}
