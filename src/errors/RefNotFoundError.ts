import { PrismicError } from "./PrismicError";

type RefNotFoundErrorAPIResponse = {
	type: "api_notfound_error";
	message: string;
};

export class RefNotFoundError extends PrismicError<RefNotFoundErrorAPIResponse> {}
