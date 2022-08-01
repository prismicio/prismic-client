import * as prismicM from "@prismicio/mock";
import * as prismicT from "@prismicio/types";

const api = prismicM.createAPIMockFactory({ seed: "createRepositoryResponse" });

export const createRepositoryResponse = (
	overrides?: Partial<prismicT.Repository>,
): prismicT.Repository => {
	return {
		...api.repository(),
		...overrides,
	};
};
