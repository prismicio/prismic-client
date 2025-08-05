import { efficientFetch } from "../lib/efficientFetch"
import type { FetchLike, RequestInitLike } from "../lib/efficientFetch"

import { ForbiddenError } from "../errors/ForbiddenError"
import { PrismicError } from "../errors/PrismicError"

export async function assetAPIFetch<T>(
	input: string,
	init: RequestInitLike | undefined,
	fetchFn: FetchLike,
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
		case 401: {
			throw new ForbiddenError(json.error || json.message, input, json)
		}
	}

	throw new PrismicError(undefined, input, json)
}
