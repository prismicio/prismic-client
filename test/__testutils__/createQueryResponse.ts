import { SetRequired } from "type-fest";
import * as prismicT from "@prismicio/types";

import { createDocument } from "./createDocument";

export const createQueryResponse = <
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
>(
	docs: SetRequired<TDocument, "uid">[] = [createDocument(), createDocument()],
	overrides?: Partial<prismicT.Query<TDocument>>,
): prismicT.Query<SetRequired<TDocument, "uid">> => {
	const page = overrides?.page ?? 1;
	const totalPages = overrides?.total_pages ?? 1;

	return {
		page,
		results_per_page: docs.length,
		results_size: docs.length,
		total_results_size: docs.length,
		total_pages: totalPages,
		next_page: page < totalPages ? "next_page_url" : null,
		prev_page: page > 0 ? "prev_page_url" : null,
		results: docs,
		...overrides,
	};
};
