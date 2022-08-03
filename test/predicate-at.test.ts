import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[at(document.type, "product")]',
	prismic.predicate.at("document.type", "product"),
);

testPredicate(
	'[at(document.tags, ["Macaron", "Cupcake"])]',
	prismic.predicate.at("document.tags", ["Macaron", "Cupcake"]),
);

testPredicate(
	"[at(my.product.price, 50)]",
	prismic.predicate.at("my.product.price", 50),
);

testPredicate(
	"[at(my.product.out_of_stock, true)]",
	prismic.predicate.at("my.product.out_of_stock", true),
);

testPredicate(
	"[at(my.product.restock_date, 1600000000000)]",
	prismic.predicate.at("my.product.restock_date", new Date(1600000000000)),
);
