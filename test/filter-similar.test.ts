import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter(
	'[similar("VkRmhykAAFA6PoBj", 10)]',
	prismic.filter.similar("VkRmhykAAFA6PoBj", 10),
)
