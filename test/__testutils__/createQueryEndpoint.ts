import * as ava from "ava";
import * as crypto from "crypto";

export const createQueryEndpoint = (t: ava.ExecutionContext): string => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");

	return `https://${repositoryName}.cdn.prismic.io/api/v2/documents/search`;
};
