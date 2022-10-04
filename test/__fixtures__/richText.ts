import * as prismic from "../../src";

import enRichTextJSON from "./enRichText.json";
import xssRichTextJSON from "./xssRichText.json";

export const richTextFixture = {
	en: enRichTextJSON as prismic.RichTextField,
	xss: xssRichTextJSON as prismic.RichTextField,
};
