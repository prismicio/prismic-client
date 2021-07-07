import { SetRequired } from "type-fest";

import * as prismic from "../../src";
import { createDocument } from "./createDocument";

import * as prismicT from "@prismicio/types";

export const createQueryResponse = <
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
>(
	docs: SetRequired<TDocument, "uid">[] = [createDocument(), createDocument()],
	overrides?: Partial<prismic.Query<TDocument>>,
): prismic.Query<SetRequired<TDocument, "uid">> => ({
	page: 1,
	results_per_page: docs.length,
	results_size: docs.length,
	total_results_size: docs.length,
	total_pages: 1,
	next_page: "",
	prev_page: "",
	results: docs,
	...overrides,
});
