import { PrismicError } from "./PrismicError.ts"

export class InvalidDataError<
	TResponse = undefined,
> extends PrismicError<TResponse> {}
