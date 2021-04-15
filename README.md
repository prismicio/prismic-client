## JavaScript development for prismic.io API v2

[![npm version](https://badge.fury.io/js/prismic-javascript.svg)](http://badge.fury.io/js/prismic-javascript)
[![Build Status](https://api.travis-ci.org/prismicio/prismic-javascript.png)](https://travis-ci.org/prismicio/prismic-javascript)

* The [source code](https://github.com/prismicio/prismic-javascript) is on Github.
* The [Changelog](https://github.com/prismicio/prismic-javascript/releases) is on Github's releases tab.
* The [API reference](https://prismicio.github.io/prismic-javascript/globals.html) is on Github.

It's meant to work in pair with the prismic-dom library available here:
* [prismic-dom](https://github.com/prismicio/prismic-dom) is on Github.

🎉Our library will hit v3 soon! That's right, it's the v3 of an API V2 package...
You can try it by installing the beta version from npm. [Read the changelog](https://github.com/prismicio/prismic-javascript/releases/tag/3.0.0)!

---


[1. Installation](#installation)
--------------------------------

> [Prismic API Settings](#prismic-api-settings) <br />
> [NPM](#npm) <br />
> [CDN](#cdn) <br />
> [Downloadable version](#downloadable-version) <br />
> [Polyfills](#polyfills) <br />
> [Demo project](#demo-project) <br />
> [Starter kits](#starter-kits) <br />

[2. Query the content](#query-the-content)
--------------------------------

[3. Integrate the content](#integrate-the-content)
-----------------------------------------------------

> [Embed](#embed) <br />
> [Image](#image) <br />
> [Text](#text) <br />
> [Number](#number) <br />
> [Date](#date) <br />
> [Timestamp](#timestamp) <br />
> [Select](#select) <br />
> [Color](#color) <br />
> [StructuredText](#structuredText) <br />
> [WebLink](#weblink) <br />
> [DocumentLink](#documentlink) <br />
> [ImageLink](#imagelink) <br />
> [FileLink](#filelink) <br />
> [Separator](#separator) <br />
> [Group](#group) <br />
> [GeoPoint](#geopoint) <br />
> [Slices](#slices) <br />

[4. Contribute to the kit](#contribute-to-the-kit)
--------------------------------
> [Install the kit locally](#install-the-kit-locally) <br />
> [Documentation](#documentation) <br />

[5. License](#license)
-----------------------------------------------------

---

### Installation

#### Prismic API Settings
Your endpoint must contains "v2" at the end, otherwise it means that you're working on the API V1 so this library won't work for you.

```javascript
apiEndpoint: your-repo-name.prismic.io/api/v2
```

#### NPM

```sh
npm install @prismicio/client --save
```

#### CDN

```
https://unpkg.com/@prismicio/client
```

(You may need to adapt the version number)

#### Downloadable version

On our release page: [https://github.com/prismicio/prismic-javascript/releases](https://github.com/prismicio/prismic-javascript/releases).

#### Polyfills
To support legacy browsers include a promise polyfill.

#### Starter kits

For new project, you can start from a sample project:

* [Node.js project](https://github.com/prismicio/nodejs-sdk)
* [Node.js blog](https://github.com/prismicio/nodejs-blog)

#### Demo project

You can find an integration of prismic content with the new API V2 in the following projects:
* [Next.js project](https://github.com/prismicio/nextjs-website)
* [Node.js project](https://github.com/prismicio/nodejs-website)

### Instantiate the Prismic Client

The client is synchronous and allow you to make queries directly to your API.

```javascript
const Prismic = require('@prismicio/client');

const options = {
  // see specifications below
}
const client = Prismic.client("http://your_repository_name.cdn.prismic.io/api", options)
```

Options:

| Param          	| Type                       	| Required 	| Default Value 	| Description                                                                                                                  	|
|----------------	|----------------------------	|----------	|---------------	|------------------------------------------------------------------------------------------------------------------------------	|
| accessToken    	| string                     	| false    	| null          	| If your API is private, pass your token to access your content                                                               	|
| routes         	| array                      	| false    	| null          	| Options used by the API to resolve link urls (replaces linkResolver)                                                         	|
| requestHandler 	| RequestHandler (see desc.) 	| false    	| null          	| See RequestHandler interface. Implements a request function and a callback to be called once request has returned.           	|
| req            	| object                     	| false    	| null          	| Request object when using the client server-side (eg: Next.js, Express, Koa...)                                               |
| apiCache       	| ApiCache (see desc.)       	| false    	| null          	| Swap default api cache with your own. Needs at least get and set properties. See ApiCache interface for full implementation. 	|
| apiDataTTL     	| number                     	| false    	| 5             	| Sets the refresh rate of API data. Used by the default api cache.                                                            	|
| proxyAgent     	| any                        	| false    	| null          	| Use your own proxy agent (eg. https://github.com/http-party/node-http-proxy)                                                 	|
| timeoutInMs    	| number                     	| false    	| null          	| Sets the timeout in milliseconds of requess. Used by the default request handler.                                            	|

### Query the content

To fetch documents from your repository, you need to instantiate the client first.

```javascript
const Prismic = require('@prismicio/client');

const client = Prismic.client("http://your_repository_name.cdn.prismic.io/api")
var options = {}; // In Node.js, pass the request as 'req' to read the reference from the cookies
client.query("", options, function(err, response) { // An empty query will return all the documents
  if (err) {
    console.log("Something went wrong: ", err);
  }
  console.log("Documents: ", response.documents);
});
```

All asynchronous calls return ES2015 promises, so alternatively you can use them instead of callbacks.

```javascript
const Prismic = require('@prismicio/client');

const client = Prismic.client("http://your_repository_name.cdn.prismic.io/api")
return client.query(""); // An empty query will return all the documents
  .then(function(response) {
    console.log("Documents: ", response.results);
  }, function(err) {
    console.log("Something went wrong: ", err);
  });
```

If you included prismic through the script tag (CDN) there is a global variable PrismicJS:
```javascript
const client = PrismicJS.client("http://your_repository_name.cdn.prismic.io/api")
const faq = PrismicJS.Predicates.at('document.type', 'faq');
client.query(faq, { lang: 'en-en' }).then( response => {
  console.log("Documents: ", response.results);
})
```

See the [developer documentation](https://prismic.io/docs) or the [API documentation](https://prismicio.github.io/prismic-javascript/globals.html) for more details on how to use it.

### Integrate the content

In each case documented below, you will have a snippet of the custom type and another for the code needed to fill the content field into your JS Template.
In these examples we have a `doc` parameter corresponding to the fetched prismic document.


#### Embed
Custom type
```javascript
"video" : {
  "type" : "Embed"
}
```

Template JS
```javascript
doc.data.video.embed_url
```

#### Image
Custom type
```javascript
"photo" : {
  "type" : "Image",
  "fieldset" : "Image",
  "config" : {
    "constraint" : {
      "width" : 300,
      "height" : 300
    },
    "thumbnails" : [ {
      "name" : "Small",
      "width" : 100,
      "height" : 100
    }, {
      "name" : "Medium",
      "width" : 200,
      "height" : 200
    }, {
      "name" : "Large",
      "width" : 300,
      "height" : 300
    } ]
  }
}
```
Template JS
```javascript
//main view
doc.data.photo.url
doc.data.photo.alt
doc.data.photo.width
doc.data.photo.height

//thumbnails => example for small view
doc.data.photo.small.url
doc.data.photo.small.alt
doc.data.photo.small.width
doc.data.photo.small.height
```
#### Text
Custom type
```javascript
"title" : {
  "type" : "Text",
}
```

Template JS
```javascript
doc.data.title
```
#### Number
Custom type
```javascript
"count" : {
  "type" : "Text",
}
```

Template JS
```javascript
doc.data.count
```
#### Date
Custom type
```javascript
"publication" : {
  "type" : "Date",
}
```

Template JS
```javascript
import { Date } from 'prismic-dom'

// date as string from the API
doc.data.publication
// date as JS Date
Date(doc.data.publication)

```
#### Timestamp
Custom type
```javascript
"time" : {
  "type" : "Timestamp",
}
```

Template JS
```javascript
import { Date } from 'prismic-dom'

// timestamp as string from the API
doc.data.time
// timestamp as JS Datetime
Date(doc.data.time)
```
#### Select
Custom type
```javascript
"gender" : {
  "type" : "Select",
}
```

Template JS
```javascript
doc.data.gender
```
#### Color
Custom type
```javascript
"background" : {
  "type" : "Color",
}
```

Template JS
```javascript
doc.data.background
```
#### RichText
Custom type
```javascript
"description" : {
  "type" : "StructuredText",
}
```

Template JS
```javascript
import { RichText } from 'prismic-dom'

RichText.asText(doc.data.description)

//linkResolver must be declare somewhere
RichText.asHtml(doc.data.description, linkResolver)
```

#### WebLink
Custom type
```javascript
"linktoweb" : {
  "type" : "Link",
  "config" : {
    "select" : "web"
  }
}
```

Template JS
```javascript
doc.data.linktoweb.url
```
#### DocumentLink
Custom type
```javascript
"linktodoc" : {
  "type" : "Link",
  "config" : {
    "select" : "document",
    "customtypes" : [ <your-custom-type-id> ],
    "tags" : [ <your-tag> ],
  }
}
```

Template JS
```javascript
//return url of the document link
doc.data.linktodoc
//return url of the document
linkResolver(doc.data.linktodoc)
```
#### ImageLink
Custom type
```javascript
"linktomedia" : {
  "type" : "Link",
  "config" : {
    "select" : "media"
  }
}
```

Template JS
```javascript
doc.data.linktomedia.url
```
#### FileLink
Custom type
```javascript
"linktofile" : {
  "type" : "Link",
  "config" : {
    "select" : "media"
  }
}
```

Template JS
```javascript
doc.data.linktofile.url
```
#### Group
Custom type
```javascript
"feature" : {
  "type" : "Group",
  "repeat": true, //default to true but put explicitly for the example
  "config" : {
    "field" : {
        "title" : {
          "type" : "Text",
        },
        "description" : {
          "type" : "StructuredText",
        }
    }
  }
}
```

Template JS
```javascript
import { RichText } from 'prismic-dom'

doc.data.feature.forEach(item => {
    item.title
    RichText.asHtml(item.description, linkResolver)
})
```
#### GeoPoint
Custom type
```javascript
"location" : {
  "type" : "GeoPoint",
}
```

Template JS
```javascript
doc.data.latitude
doc.data.longitude
```
#### Slices
**Slice with Group as value**
The Group value will be put directly as Slice value
Custom type
```javascript
"contentAsSlices" : {
    "fieldset" : "Dynamic page zone...",
    "type" : "Slices",
    "config" : {
        "choices" : {
            "slides" : {
                "type" : "Group",
                //required to display name in slice select in the writing room
                "fieldset" : "Slides",
                "config" : {
                    "fields" : {
                        "illustration" : {
                          "type" : "Image"
                        },
                        "title" : {
                          "type" : "StructuredText"
                        }
                    }
                }
            }
        }
    }
}
```

Template JS
```javascript
for(slice in doc.data.contentAsSlices) {
    switch(slice.slice_type) {
        case 'slides':
          slice.value.forEach(item => {
            item.illustration.url
            item.title
          })
          break
    }
}

```
**Slice with basic fragment like Text as value**
The fragment value will be put directly as Slice value
Custom type
```javascript
"contentAsSlices" : {
    "fieldset" : "Dynamic page zone...",
    "type" : "Slices",
    "config" : {
        "choices" : {
            "description" : {
              "type" : "StructuredText"
            }
        }
    }
}
```

Template JS
```javascript
import { RichText } from 'prismic-dom'

for(slice in doc.contentAsSlices) {
    switch(slice.slice_type) {
        case 'description':
            RichText.asHtml(slice.value, linkResolver)
            break
    }
}

```

**new Slice**
the new Slice type allow you to create a repeatable area and a non repeatable one.
```javascript
"contentAsSlices" : {
    "fieldset" : "Dynamic page zone...",
    "type" : "Slices",
    "config" : {
        "choices" : {
            "newslice" : {
              "type" : "Slice",
              "non-repeat": {
                "title": {
                  "type": "Text"
                }
              },
              "repeat": {
                "description": {
                  "type" : "StructuredText"
                }
              }
            }
        }
    }
}
```

Template JS
```javascript
import { RichText } from 'prismic-dom'

for(slice in doc.contentAsSlices) {
    switch(slice.slice_type) {
        case 'newslice':
          //non repeatable part
          slice.value.primary.title

          //repeatable part
          slice.value.items.forEach(item => {
            RichText.asHtml(item.description, linkResolver)
          })
          break
    }
}

```

### Contribute to the kit

#### Install the kit locally

Source files are in the `src/` directory. You only need [Node.js and npm](http://www.joyent.com/blog/installing-node-and-npm/)
to work on the codebase.

```bash
npm install
npm run dev
```

#### Documentation

Please document any new feature or bugfix using the [JSDoc](http://usejsdoc.org/) syntax. You don't need to generate the documentation, we'll do that.

If you feel an existing area of code is lacking documentation, feel free to write it; but please do so on its own branch and pull-request.

If you find existing code that is not optimally documented and wish to make it better, we really appreciate it; but you should document it on its own branch and its own pull request.

### License

This software is licensed under the Apache 2 license, quoted below.

Copyright 2013-2017 Prismic.io (http://prismic.io).

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
