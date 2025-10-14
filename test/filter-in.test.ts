import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter(
	'[in(document.id, ["V9rIvCQAAB0ACq6y", "V9ZtvCcAALuRUzmO"])]',
	prismic.filter.in("document.id", ["V9rIvCQAAB0ACq6y", "V9ZtvCcAALuRUzmO"]),
)

testFilter(
	'[in(my.page.uid, ["myuid1", "myuid2"])]',
	prismic.filter.in("my.page.uid", ["myuid1", "myuid2"]),
)
