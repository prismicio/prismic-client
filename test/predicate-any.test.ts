import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[any(document.type, ["product", "blog-post"])]',
	prismic.predicate.any("document.type", ["product", "blog-post"]),
);

testPredicate(
	"[any(my.product.out_of_stock, [true, false])]",
	prismic.predicate.any("my.product.out_of_stock", [true, false]),
);

testPredicate(
	"[any(my.product.restock_date, [1600000000000, 1700000000000])]",
	prismic.predicate.any("my.product.restock_date", [
		new Date(1600000000000),
		new Date(1700000000000),
	]),
);
