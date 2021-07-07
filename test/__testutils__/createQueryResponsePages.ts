import { SetRequired } from "type-fest";

import * as prismic from "../../src";

import { createDocument } from "./createDocument";
import { createQueryResponse } from "./createQueryResponse";
import * as prismicT from "@prismicio/types";

type CreateQueryResponsePagesArgs<
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
> = {
	numPages?: number;
	numDocsPerPage?: number;
	fields?: Partial<TDocument>;
};

export const createQueryResponsePages = <
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
>({
	numPages = 3,
	numDocsPerPage = 3,
	fields,
}: CreateQueryResponsePagesArgs<TDocument>): prismic.Query<
	SetRequired<TDocument, "uid">
>[] => {
	const documents = Array(numDocsPerPage)
		.fill(undefined)
		.map(() => createDocument(fields));

	return Array(numPages)
		.fill(undefined)
		.map((_, i, arr) =>
			createQueryResponse(documents, {
				page: i + 1,
				total_pages: arr.length,
			}),
		);
};
