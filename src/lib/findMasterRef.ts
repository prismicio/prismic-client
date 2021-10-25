import * as prismicT from "@prismicio/types";

import { findRef } from "./findRef";

/**
 * Returns the master ref from a list of given refs.
 *
 * @param refs - A list of refs to search.
 *
 * @returns The master ref from the list.
 * @throws If a matching ref cannot be found.
 */
export const findMasterRef = (refs: prismicT.Ref[]): prismicT.Ref => {
	return findRef(refs, (ref) => ref.isMasterRef);
};
