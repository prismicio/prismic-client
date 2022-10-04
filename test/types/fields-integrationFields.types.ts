import { expectType, expectNever } from "ts-expect";

import * as prismic from "../../src";

(value: prismic.IntegrationFields): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				return true;
			}

			return true;
		}

		default: {
			return expectNever(value);
		}
	}
};

/**
 * Filled state.
 */
expectType<prismic.IntegrationFields>({
	foo: "bar",
});
expectType<prismic.IntegrationFields<Record<string, unknown>, "filled">>({
	foo: "bar",
});
expectType<prismic.IntegrationFields<Record<string, unknown>, "empty">>(
	// @ts-expect-error - Empty fields cannot contain a filled value.
	{
		foo: "bar",
	},
);

/**
 * Empty state.
 */
expectType<prismic.IntegrationFields>(null);
expectType<prismic.IntegrationFields<Record<string, unknown>, "empty">>(null);
expectType<prismic.IntegrationFields<Record<string, unknown>, "filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
);

/**
 * Supports custom blob type.
 */
expectType<prismic.IntegrationFields<{ foo: "bar" }>>({
	foo: "bar",
});
expectType<prismic.IntegrationFields<{ foo: "bar" }>>({
	// @ts-expect-error - Blob should match the given type.
	baz: "qux",
});
