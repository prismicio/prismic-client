import type { FetchLike, RequestInitLike } from "../lib/efficientFetch"
import { efficientFetch } from "../lib/efficientFetch"

import { ForbiddenError } from "../errors/ForbiddenError"
import { NotFoundError } from "../errors/NotFoundError"
import { ParsingError } from "../errors/ParsingError"
import { PreviewTokenExpiredError } from "../errors/PreviewTokenExpired"
import { PrismicError } from "../errors/PrismicError"
import { RefExpiredError } from "../errors/RefExpiredError"
import { RefNotFoundError } from "../errors/RefNotFoundError"
import { RepositoryNotFoundError } from "../errors/RepositoryNotFoundError"

export async function contentAPIFetch<T>(
	input: string,
	init: RequestInitLike | undefined,
	fetchFn: FetchLike,
	documentAPIEndpoint: string,
): Promise<T> {
	const response = await efficientFetch(input, init, fetchFn)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let json: any
	try {
		json = await response.clone().json()
	} catch {
		// noop
	}

	if (response.ok) {
		return json as T
	}

	const text = await response.text()

	switch (response.status) {
		// - Invalid filter syntax
		// - Ref not provided (ignored)
		case 400: {
			throw new ParsingError(json.message, input, json)
		}

		// - Missing access token for repository endpoint
		// - Incorrect access token for repository endpoint
		case 401:
		// - Missing access token for query endpoint
		// - Incorrect access token for query endpoint
		case 403: {
			throw new ForbiddenError(json.error || json.message, input, json)
		}

		// - Incorrect repository name (this response has an empty body)
		// - Ref does not exist
		// - Preview token is expired
		case 404: {
			if (json === undefined) {
				throw new RepositoryNotFoundError(
					`Prismic repository not found. Check that "${documentAPIEndpoint}" is pointing to the correct repository.`,
					input,
					input.startsWith(documentAPIEndpoint) ? undefined : text,
				)
			}

			if (json.type === "api_notfound_error") {
				throw new RefNotFoundError(json.message, input, json)
			}

			if (
				json.type === "api_security_error" &&
				/preview token.*expired/i.test(json.message)
			) {
				throw new PreviewTokenExpiredError(json.message, input, json)
			}

			throw new NotFoundError(json.message, input, json)
		}

		// - Ref is expired
		case 410: {
			throw new RefExpiredError(json.message, input, json)
		}
	}

	throw new PrismicError(undefined, input, json)
}
