import * as prismicT from "@prismicio/types";

export type GetContext = {
	repositoryResponse: prismicT.Repository;
	getRef(repository: prismicT.Repository): string;
};
