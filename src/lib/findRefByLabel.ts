import * as prismicT from "@prismicio/types";

import { findRef } from "./findRef";

/**
 * Returns the ref from a list of given refs with a matching label.
 *
 * @param refs - A list of refs to search.
 * @param id - The label of the ref to find.
 *
 * @returns The ref with a matching label from the list.
 * @throws If a matching ref cannot be found.
 */
export const findRefByLabel = (
	refs: prismicT.Ref[],
	label: string,
): prismicT.Ref => {
	return findRef(refs, (ref) => ref.label === label);
};
