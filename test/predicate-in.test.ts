import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[in(document.id, ["V9rIvCQAAB0ACq6y", "V9ZtvCcAALuRUzmO"])]',
	prismic.predicate.in("document.id", ["V9rIvCQAAB0ACq6y", "V9ZtvCcAALuRUzmO"]),
);

testPredicate(
	'[in(my.page.uid, ["myuid1", "myuid2"])]',
	prismic.predicate.in("my.page.uid", ["myuid1", "myuid2"]),
);
