export class PrismicError<Response> extends Error {
	url?: string
	response: Response

	constructor(
		message = "An invalid API response was returned",
		url: string | undefined,
		response: Response,
	) {
		super(message)

		this.url = url
		this.response = response
	}
}

type ForbiddenErrorRepositoryAPIResponse = {
	type: string
	message: string
}

type ForbiddenErrorQueryAPIResponse = {
	error: string
}

export class ForbiddenError<
	TResponse =
		| ForbiddenErrorRepositoryAPIResponse
		| ForbiddenErrorQueryAPIResponse,
> extends PrismicError<TResponse> {}

export class NotFoundError<
	TResponse = undefined,
> extends PrismicError<TResponse> {}

export class RepositoryNotFoundError<
	TResponse = undefined,
> extends NotFoundError<TResponse> {}

type ParsingErrorAPIResponse = {
	type: "parsing-error"
	message: string
	pos: {
		line: number
		column: number
		id: number
		location: string
	}
}

export class ParsingError<
	TResponse = ParsingErrorAPIResponse,
> extends PrismicError<TResponse> {}

export class InvalidDataError<
	TResponse = undefined,
> extends PrismicError<TResponse> {}

type RefExpiredErrorAPIResponse = {
	type: "api_validation_error"
	message: string
}

// This error extends `ForbiddenError` for backwards compatibility. Before the
// API started returning 410 for expired refs, it returnd 403, which threw a
// `ForbiddenError`.
// TODO: Extend this error from `PrismicError` in v8.
export class RefExpiredError<
	TResponse = RefExpiredErrorAPIResponse,
> extends ForbiddenError<TResponse> {}

type RefNotFoundErrorAPIResponse = {
	type: "api_notfound_error"
	message: string
}

// This error extends `ForbiddenError` for backwards compatibility. Before the
// API started returning 404 for not found refs, it returnd 403, which threw a
// `ForbiddenError`.
// TODO: Extend this error from `PrismicError` in v8.
export class RefNotFoundError<
	TResponse = RefNotFoundErrorAPIResponse,
> extends ForbiddenError<TResponse> {}

type PreviewTokenExpiredErrorAPIResponse = {
	type: "api_security_error"
	message: string
}

// This error extends `ForbiddenError` for backwards compatibility.
// TODO: Extend this error from `PrismicError` in v8.
export class PreviewTokenExpiredError<
	TResponse = PreviewTokenExpiredErrorAPIResponse,
> extends ForbiddenError<TResponse> {}
