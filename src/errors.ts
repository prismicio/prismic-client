import type { ResponseLike } from "./lib/request"

export class PrismicError extends Error {}

export class InvalidDataError extends PrismicError {}

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

export class ContentAPIError extends APIError {}
export class ParsingError extends ContentAPIError {}
export class ForbiddenError extends ContentAPIError {}

export class RefExpiredError extends ContentAPIError {}
export class PreviewTokenExpiredError extends RefExpiredError {}

export class NotFoundError extends ContentAPIError {}
export class DocumentNotFoundError extends NotFoundError {}
export class RepositoryNotFoundError extends NotFoundError {}
export class RefNotFoundError extends NotFoundError {}
export class ReleaseNotFoundError extends RefNotFoundError {}

export class AssetAPIError extends APIError {}

export class MigrationAPIError extends APIError {}
