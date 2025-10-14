import arRichTextJSON from "../__fixtures__/arRichText.json.ts"
import cnRichTextJSON from "../__fixtures__/cnRichText.json.ts"
import emojiRichTextJSON from "../__fixtures__/emojiRichText.json.ts"
import enRichTextJSON from "../__fixtures__/enRichText.json.ts"
import koRichTextJSON from "../__fixtures__/koRichText.json.ts"
import overlappedRichTextJSON from "../__fixtures__/overlappedRichText.json.ts"
import xssRichTextJSON from "../__fixtures__/xssRichText.json.ts"

import type { RichTextField } from "../../src/index.ts"

const deepCloneJSON = <T>(json: T): T => {
	return JSON.parse(JSON.stringify(json))
}

export const createRichTextFixtures = (): Record<
	"en" | "ar" | "cn" | "ko" | "emoji" | "overlapped" | "xss",
	RichTextField
> => {
	return {
		en: deepCloneJSON(enRichTextJSON) as RichTextField,
		ar: deepCloneJSON(arRichTextJSON) as RichTextField,
		cn: deepCloneJSON(cnRichTextJSON) as RichTextField,
		ko: deepCloneJSON(koRichTextJSON) as RichTextField,
		emoji: deepCloneJSON(emojiRichTextJSON) as RichTextField,
		overlapped: deepCloneJSON(overlappedRichTextJSON) as RichTextField,
		xss: deepCloneJSON(xssRichTextJSON) as RichTextField,
	}
}
