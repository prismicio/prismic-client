import * as prismic from "@prismicio/client";
import fetch from "node-fetch";

const endpoint = prismic.getEndpoint("qwerty");
const client = prismic.createClient(endpoint, {
	fetch,
	// A default language can be set here. If a `lang` option is not set, your
	// repository's default language will be used.
	defaultParams: {
		lang: "en-us",
	},
});

// This will fetch Article documents with the `en-us` lang.
const articlesDefaultLanguage = await client.getAllByType("article");
console.info("articlesDefaultLanguage: ", articlesDefaultLanguage);

// This will also fetch Article documents with the `en-us` lang.
const articlesEnglish = await client.getAllByType("article", { lang: "en-us" });
console.info("articlesEnglish: ", articlesEnglish);

// This will fetch Article documents with the `fr-fr` lang.
const articlesFrench = await client.getAllByType("article", { lang: "fr-fr" });
console.info("articlesFrench: ", articlesFrench);

// This will fetch Article documents with any language.
const articlesAllLanguages = await client.getAllByType("article", {
	lang: "*",
});
console.info("articlesAllLanguages: ", articlesAllLanguages);
