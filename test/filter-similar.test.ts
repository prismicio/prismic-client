import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	'[similar("VkRmhykAAFA6PoBj", 10)]',
	prismic.filter.similar("VkRmhykAAFA6PoBj", 10),
)
