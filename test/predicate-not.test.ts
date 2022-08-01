import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[not(document.type, "product")]',
	prismic.predicate.not("document.type", "product"),
);

testPredicate(
	'[not(document.tags, ["Macaron", "Cupcake"])]',
	prismic.predicate.not("document.tags", ["Macaron", "Cupcake"]),
);

testPredicate(
	"[not(my.product.price, 50)]",
	prismic.predicate.not("my.product.price", 50),
);

testPredicate(
	"[not(my.product.out_of_stock, true)]",
	prismic.predicate.not("my.product.out_of_stock", true),
);

testPredicate(
	"[not(my.product.restock_date, 1600000000000)]",
	prismic.predicate.not("my.product.restock_date", new Date(1600000000000)),
);
