import { PrismicError } from "./PrismicError";

type ParsingErrorAPIResponse = {
	type: "parsing-error";
	message: string;
	line: number;
	column: number;
	id: number;
	location: string;
};

export class ParsingError extends PrismicError<ParsingErrorAPIResponse> {}
