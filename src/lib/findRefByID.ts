import { Ref } from "../types/api/ref";

import { findRef } from "./findRef";

/**
 * Returns the ref from a list of given refs with a matching ID.
 *
 * @param refs - A list of refs to search.
 * @param id - The ID of the ref to find.
 *
 * @returns The ref with a matching ID from the list.
 *
 * @throws If a matching ref cannot be found.
 */
export const findRefByID = (refs: Ref[], id: string): Ref => {
	return findRef(refs, (ref) => ref.id === id);
};
