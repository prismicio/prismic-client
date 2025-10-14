import emptyDocumentJSON from "./emptyDocument.json.ts"

import type * as prismic from "../../src/index.ts"

export const documentFixture = {
	empty: emptyDocumentJSON as prismic.PrismicDocument,
}
