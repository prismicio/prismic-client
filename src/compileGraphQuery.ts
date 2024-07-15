import { BooleanField } from "./types/value/boolean";
import { ContentRelationshipField } from "./types/value/contentRelationship";
import { PrismicDocument } from "./types/value/document";
import { GroupField } from "./types/value/group";
import { KeyTextField } from "./types/value/keyText";
import { LinkField } from "./types/value/link";
import { SliceZone } from "./types/value/sliceZone";
import { AnyRegularField } from "./types/value/types";

import { ExtractDocumentType } from "./createClient";

type GraphQuery<TDocuments extends PrismicDocument> = {
	[Type in TDocuments["type"]]?: GraphQueryFields<
		TDocuments,
		ExtractDocumentType<TDocuments, Type>["data"]
	>;
};

type GraphQueryFields<
	TDocuments extends PrismicDocument,
	TFields extends Record<string, AnyRegularField | GroupField | SliceZone>,
> =
	| {
			[FieldID in keyof TFields]?: GraphQueryField<
				TDocuments,
				TFields[FieldID]
			>;
	  }
	| "all";

type GraphQueryField<
	TDocuments extends PrismicDocument,
	TField extends AnyRegularField | GroupField | SliceZone,
> = TField extends ContentRelationshipField<
	infer ContentRelationshipDocumentTypes
>
	? ContentRelationshipDocumentTypes extends TDocuments["type"]
		? {
				[OnContentRelationshipDocumentType in AddOnPrefix<ContentRelationshipDocumentTypes>]: GraphQueryFields<
					TDocuments,
					ExtractDocumentType<
						TDocuments,
						RemoveOnPrefix<OnContentRelationshipDocumentType>
					>["data"]
				>;
		  }
		: never
	: TField extends GroupField<infer Fields>
	? GraphQueryFields<TDocuments, Fields>
	: TField extends AnyRegularField
	? boolean
	: never;

type AddOnPrefix<Values extends string> = Values extends string
	? `on_${Values}`
	: never;

type RemoveOnPrefix<Value extends string> = Value extends `on_${infer U}`
	? U
	: never;

export const compileGraphQuery = <TDocuments extends PrismicDocument>(
	query: GraphQuery<TDocuments>,
): string => {
	return JSON.stringify(query);
};

type SampleDocuments =
	| PrismicDocument<
			{
				title: KeyTextField;
				author: ContentRelationshipField<"author" | "external_author">;
			},
			"blog_post"
	  >
	| PrismicDocument<
			{
				name: KeyTextField;
				featured_blog_post: ContentRelationshipField<"blog_post">;
				tags: GroupField<{ tag: KeyTextField }>;
			},
			"author"
	  >
	| PrismicDocument<
			{
				name: KeyTextField;
				url: LinkField;
				featured_blog_post: ContentRelationshipField<"blog_post">;
			},
			"external_author"
	  >
	| PrismicDocument<{ boolean: BooleanField }, "settings">;
type SampleQuery = GraphQuery<SampleDocuments>;
const query = compileGraphQuery<SampleDocuments>({
	blog_post: {
		author: {
			on_author: {
				name: true,
				tags: { tag: "all" },
			},
		},
	},
});
