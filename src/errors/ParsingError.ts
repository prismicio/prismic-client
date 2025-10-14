import { PrismicError } from "./PrismicError.ts"

type ParsingErrorAPIResponse = {
	type: "parsing-error"
	message: string
	pos: {
		line: number
		column: number
		id: number
		location: string
	}
}

export class ParsingError<
	TResponse = ParsingErrorAPIResponse,
> extends PrismicError<TResponse> {}
