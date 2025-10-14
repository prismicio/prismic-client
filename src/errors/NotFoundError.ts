import { PrismicError } from "./PrismicError.ts"

export class NotFoundError<
	TResponse = undefined,
> extends PrismicError<TResponse> {}
