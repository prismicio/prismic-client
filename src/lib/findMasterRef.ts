import { Ref } from "../types/api/ref";

import { findRef } from "./findRef";

/**
 * Returns the master ref from a list of given refs.
 *
 * @param refs - A list of refs to search.
 *
 * @returns The master ref from the list.
 *
 * @throws If a matching ref cannot be found.
 */
export const findMasterRef = (refs: Ref[]): Ref => {
	return findRef(refs, (ref) => ref.isMasterRef);
};
