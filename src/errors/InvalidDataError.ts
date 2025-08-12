import { PrismicError } from "./PrismicError"

export class InvalidDataError<
	TResponse = undefined,
> extends PrismicError<TResponse> {}
