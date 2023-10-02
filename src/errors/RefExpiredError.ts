import { PrismicError } from "./PrismicError";

type RefExpiredErrorAPIResponse = {
	type: "api_validation_error";
	message: string;
};

export class RefExpiredError extends PrismicError<RefExpiredErrorAPIResponse> {}
