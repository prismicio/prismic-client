import type { ResponseLike } from "./lib/request"

export class PrismicError extends Error {}

export class APIError extends PrismicError {
	response?: ResponseLike
	constructor(
		message: string | undefined,
		options: ErrorOptions & { response?: ResponseLike } = {},
	) {
		const { response, ...otherOptions } = options

		super(message, otherOptions)

		this.response = response
	}

	get url(): string | undefined {
		return this.response?.url
	}
}

export class InvalidDataError extends APIError {}
export class ParsingError extends APIError {}
export class ForbiddenError extends APIError {}

export class RefExpiredError extends APIError {}
export class PreviewTokenExpiredError extends RefExpiredError {}

export class NotFoundError extends APIError {}
export class DocumentNotFoundError extends NotFoundError {}
export class RepositoryNotFoundError extends NotFoundError {}
export class RefNotFoundError extends NotFoundError {}
export class ReleaseNotFoundError extends RefNotFoundError {}
