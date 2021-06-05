import { Repository } from "../../src";

export type GetContext = {
	repositoryResponse: Repository;
	getRef(repository: Repository): string;
};
