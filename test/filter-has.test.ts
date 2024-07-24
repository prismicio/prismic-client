import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter("[has(my.product.price)]", prismic.filter.has("my.product.price"))
