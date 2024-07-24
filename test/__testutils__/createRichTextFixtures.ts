import cnRichTextJSON from "../__fixtures__/cnRichText.json"
import emojiRichTextJSON from "../__fixtures__/emojiRichText.json"
import enRichTextJSON from "../__fixtures__/enRichText.json"
import koRichTextJSON from "../__fixtures__/koRichText.json"
import overlappedRichTextJSON from "../__fixtures__/overlappedRichText.json"
import xssRichTextJSON from "../__fixtures__/xssRichText.json"

import type { RichTextField } from "../../src"

const deepCloneJSON = <T>(json: T): T => {
	return JSON.parse(JSON.stringify(json))
}

export const createRichTextFixtures = (): Record<
	"en" | "cn" | "ko" | "emoji" | "overlapped" | "xss",
	RichTextField
> => {
	return {
		en: deepCloneJSON(enRichTextJSON) as RichTextField,
		cn: deepCloneJSON(cnRichTextJSON) as RichTextField,
		ko: deepCloneJSON(koRichTextJSON) as RichTextField,
		emoji: deepCloneJSON(emojiRichTextJSON) as RichTextField,
		overlapped: deepCloneJSON(overlappedRichTextJSON) as RichTextField,
		xss: deepCloneJSON(xssRichTextJSON) as RichTextField,
	}
}
