import { NotFoundError } from "./NotFoundError.ts"

export class RepositoryNotFoundError<
	TResponse = undefined,
> extends NotFoundError<TResponse> {}
