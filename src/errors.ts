import type { ResponseLike } from "./Client2"

export class PrismicError extends Error {}

export class ContentAPIError extends PrismicError {
	response: ResponseLike
	constructor(
		message: string | undefined,
		options: ErrorOptions & { response: ResponseLike },
	) {
		const { response, ...otherOptions } = options

		super(message, otherOptions)

		this.response = response
	}

	get url(): string {
		return this.response.url
	}
}

export class ParsingError extends ContentAPIError {}

export class ForbiddenError extends ContentAPIError {}

export class RefNotFoundError extends ContentAPIError {}

export class RefExpiredError extends ContentAPIError {}

export class PreviewTokenExpiredError extends ContentAPIError {}

export class NotFoundError extends ContentAPIError {}
