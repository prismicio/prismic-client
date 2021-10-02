import { PrismicError } from "./PrismicError";

type ParsingErrorAPIResponse = {
	type: "parsing-error";
	message: string;
	line: number;
	column: number;
	id: number;
	location: string;
};

type ParsingErrorArgs = {
	url: string;
	response: ParsingErrorAPIResponse;
};

export class ParsingError extends PrismicError {
	response: ParsingErrorAPIResponse;
	line: number;
	column: number;
	id: number;
	location: string;

	constructor(message: string, args: ParsingErrorArgs) {
		super(message, args);

		this.response = args.response;
		this.line = args.response.line;
		this.column = args.response.column;
		this.id = args.response.id;
		this.location = args.response.location;
	}
}
