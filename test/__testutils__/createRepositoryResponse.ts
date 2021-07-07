import * as prismic from "../../src";

import { createRef } from "./createRef";

export const createRepositoryResponse = (
	overrides?: Partial<prismic.Repository>,
): prismic.Repository => {
	return {
		refs: [createRef(true)],
		bookmarks: {
			faq: "UfkL59_mqdr73EGn",
			contact: "UiYZpsuvzXwFMOzj",
			"api-tour-with-features": "VBrV3TYAADUA1Mny",
			"documentation-home": "VjJLaCYAAM4A440I",
			home: "UXfsJN_mqUsB7XMH",
			privacy: "UkGz7LGIJ0YAoERn",
			"api-tour": "UffKf9_mqUl63EF8",
			signup: "UfkNbd_mqWf83EGr",
			terms: "UkGz1rGIJ0YAoERj",
			"wr-tour": "UffK5t_mqW963EGA",
			"wr-tour-with-features": "VBrVKjYAADMA1MiX",
			"developers-home": "UjBJcsuvzdIHvE3_",
			customers: "Vebi4x8AAB4AFXCd",
			pricing: "UffVud_mqZR-3EGd",
		},
		languages: [
			{
				id: "en-gb",
				name: "English - Great Britain",
			},
			{
				id: "fr-fr",
				name: "French - France",
			},
			{
				id: "de-de",
				name: "German - Germany",
			},
			{
				id: "de-ch",
				name: "German - Switzerland",
			},
			{
				id: "nl-nl",
				name: "Dutch - Netherlands",
			},
			{
				id: "es-es",
				name: "Spanish - Spain (Traditional)",
			},
			{
				id: "en-dk",
				name: "English - Denmark",
			},
			{
				id: "en-se",
				name: "English - Sweden",
			},
		],
		types: {
			foo: "Foo",
		},
		tags: ["foo", "bar"],
		forms: {},
		experiments: {
			draft: [
				{
					id: "WG-DPigAAJMbct0d",
					name: "Test_sre",
					variations: [
						{
							id: "WG-DPigAADIbct0f",
							ref: "WG-DPigAADgAct0g~WYx9HB8AAB8AmX7z",
							label: "Base",
						},
					],
				},
			],
			running: [
				{
					id: "WG-DPigAAJMbct0X",
					name: "experimentA",
					variations: [
						{
							id: "WG-DPigAADIbct0X",
							ref: "WG-DPigAADgAct0g~WYx9HB8AAB8AmX7X",
							label: "variationA",
						},
					],
				},
			],
		},
		oauth_initiate: "oauth_initiate",
		oauth_token: "oauth_token",
		version: "version",
		license: "All Rights Reserved",
		...overrides,
	};
};
