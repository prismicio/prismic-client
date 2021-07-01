import * as prismic from "../../src";

export const createCustomTypeMetadata = (
	overrides?: Partial<prismic.CustomType>
): prismic.CustomType => {
	const id = Math.random().toString();
	const label = Math.random().toString();

	return {
		id,
		status: true,
		json: {},
		label: label,
		repeatable: true,
		...overrides
	};
};
