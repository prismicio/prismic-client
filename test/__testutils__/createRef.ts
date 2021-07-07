import * as prismic from "../../src";

export const createRef = (
	isMasterRef = false,
	overrides?: Partial<prismic.Ref>,
): prismic.Ref => {
	const id = Math.random().toString();
	const ref = Math.random().toString();
	const label = Math.random().toString();

	return {
		id,
		ref,
		label,
		isMasterRef,
		...overrides,
	};
};
