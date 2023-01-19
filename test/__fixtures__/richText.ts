import enRichTextJSON from "./enRichText.json";
import xssRichTextJSON from "./xssRichText.json";

import * as prismic from "../../src";

export const richTextFixture = {
	en: enRichTextJSON as prismic.RichTextField,
	xss: xssRichTextJSON as prismic.RichTextField,
};
