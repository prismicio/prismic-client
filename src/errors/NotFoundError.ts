import { PrismicError } from "./PrismicError";

export class NotFoundError<
	TResponse = undefined,
> extends PrismicError<TResponse> {}
