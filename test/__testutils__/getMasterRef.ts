import * as prismic from "../../src";

export const getMasterRef = (
	repositoryResponse: prismic.Repository,
): string => {
	const masterRef = repositoryResponse.refs.find((ref) => ref.isMasterRef);

	if (!masterRef) {
		throw new Error("Could not find master ref");
	}

	return masterRef.ref;
};
