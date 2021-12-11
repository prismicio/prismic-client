import * as prismicT from "@prismicio/types";

export const createRef = (
	isMasterRef = false,
	overrides?: Partial<prismicT.Ref>,
): prismicT.Ref => {
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
