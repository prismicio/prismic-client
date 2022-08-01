import * as prismicM from "@prismicio/mock";
import * as prismicT from "@prismicio/types";

const api = prismicM.createAPIMockFactory({ seed: "createRef" });

export const createRef = (
	isMasterRef = false,
	overrides?: Partial<prismicT.Ref>,
): prismicT.Ref => {
	return {
		...api.ref({ isMasterRef }),
		...overrides,
	};
};
