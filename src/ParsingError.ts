interface ParsingErrorAPIResponse {
	type: "parsing-error";
	message: string;
	line: number;
	column: number;
	id: number;
	location: string;
}

export const isParsingErrorAPIResponse = (
	input: unknown
): input is ParsingErrorAPIResponse => {
	return (
		typeof input === "object" &&
		input !== null &&
		"message" in input &&
		"type" in input
	);
};

type ParsingErrorArgs = {
	url: string;
	response: ParsingErrorAPIResponse;
};

export class ParsingError extends Error {
	url: string;
	line: number;
	column: number;
	id: number;
	location: string;

	constructor(message: string, args: ParsingErrorArgs) {
		super(message);

		this.url = args.url;
		this.line = args.response.line;
		this.column = args.response.column;
		this.id = args.response.id;
		this.location = args.response.location;
	}
}
