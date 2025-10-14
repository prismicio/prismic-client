import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter("[has(my.product.price)]", prismic.filter.has("my.product.price"))
