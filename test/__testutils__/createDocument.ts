import * as prismicT from "@prismicio/types";

export const createDocument = <
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
>(
	fields?: Partial<TDocument>,
): TDocument & { uid: string } => {
	const id = Math.random().toString();
	const uid = Math.random().toString();

	return {
		id,
		uid,
		type: "type",
		href: "href",
		tags: ["tag"],
		slugs: ["slug"],
		lang: "lang",
		alternate_languages: [],
		first_publication_date: "first_publication_date",
		last_publication_date: "last_publication_date",
		linked_documents: [],
		...fields,
		data: {
			...fields?.data,
		},
	} as TDocument & { uid: string };
};
