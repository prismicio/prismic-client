import { NotFoundError } from "./NotFoundError";

export class RepositoryNotFoundError<
	TResponse = undefined,
> extends NotFoundError<TResponse> {}
