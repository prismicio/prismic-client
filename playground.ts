import { htmlAsRichText } from "./src/richtext/htmlAsRichText";
import { markdownAsRichText } from "./src/richtext/markdownAsRichText";

console.clear();

const processedHTML = await htmlAsRichText(`
<h1>Heading 1</h1>
<p>
	Lorem ipsum <strong>d<em>olor</em></strong><em> sit</em> amet,
	consectetur <a href="https://google.com" target="_self">adipiscing</a> elit.
</p>
<p>
	Lorem ipsum dolor sit amet,
	consectetur adipiscing elit,<br />
	sed do eiusmod tempor incididunt.
</p>
<pre>foo</pre>
<ul>
  <li>Item 1</li>
	<li>Item 2</li>
</ul>
<ol>
  <li>Item 1</li>
	<li>Item 2</li>
</ol>
`);

console.log({ input: processedHTML.value });
console.log("\n[");
processedHTML.result.map((node) => console.log(node));
console.log("]\n");

// const processedMarkdown = await markdownAsRichText(`
// # Heading 1

// Paragraph 1

// \`\`\`
// foo
// \`\`\`
// `);

// console.log(processedMarkdown);
