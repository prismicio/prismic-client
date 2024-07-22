import { ForbiddenError } from "./ForbiddenError";

type PreviewTokenExpiredErrorAPIResponse = {
	type: "api_security_error";
	message: string;
};

// This error extends `ForbiddenError` for backwards compatibility.
// TODO: Extend this error from `PrismicError` in v8.
export class PreviewTokenExpiredError<
	TResponse = PreviewTokenExpiredErrorAPIResponse,
> extends ForbiddenError<TResponse> {}
