import ApiSearchResponse from './ApiSearchResponse';

export interface Field {
  [key: string]: string;
  value: string;
}

export interface Form {
  fields: any;
  action: string;
  name: string;
  rel: string;
  form_method: string;
  enctype: string;
}

export class SearchForm {
  api: ResolvedApi;
  form: Form;
  data: any;

  constructor(api: ResolvedApi, form: Form) {
    this.api = api;
    this.form = form;

    this.data = {};
    for (const field in form.fields) {
      if (form.fields[field]['default']) {
        this.data[field] = [form.fields[field]['default']];
      }
    }
  }

  set(field: string, value: any): SearchForm {
    const fieldDesc = this.form.fields[field];
    if (!fieldDesc) throw new Error("Unknown field " + field);
    let values = this.data[field] || [];
    if (value === '' || value === undefined) {
      // we must compare value to null because we want to allow 0
      value = null;
    }
    if (fieldDesc.multiple) {
      if (value) values.push(value);
    } else {
      values = value && [value];
    }
    this.data[field] = values;
    return this;
  }

  /**
   * Sets a ref to query on for this SearchForm. This is a mandatory
   * method to call before calling submit(), and api.form('everything').submit()
   * will not work.
   */
  ref(ref: string): SearchForm {
    return this.set("ref", ref);
  }

  /**
   * Sets a predicate-based query for this SearchForm. This is where you
   * paste what you compose in your prismic.io API browser.
   */
  query(query: string | string[]): SearchForm {
    if (typeof query === 'string') {
      return this.query([query]);
    } else if(query instanceof Array) {
      return this.set("q", (`[${query.join("")}]`));
    } else {
      throw new Error(`Invalid query : ${query}`)
    }
  }

  /**
   * Sets a page size to query for this SearchForm. This is an optional method.
   *
   * @param {number} size - The page size
   * @returns {SearchForm} - The SearchForm itself
   */
  pageSize(size: number): SearchForm {
    return this.set("pageSize", size);
  }

  /**
   * Restrict the results document to the specified fields
   */
  fetch(fields: string | string[]): SearchForm {
    const strFields = fields instanceof Array ? fields.join(",") : fields;
    return this.set("fetch", strFields);
  }

  /**
   * Include the requested fields in the DocumentLink instances in the result
   */
  fetchLinks(fields: string | string[]): SearchForm {
    const strFields = fields instanceof Array ? fields.join(",") : fields;
    return this.set("fetchLinks", strFields);
  }

  /**
   * Sets the language to query for this SearchForm. This is an optional method.
   */
  lang(langCode: string) {
    return this.set("lang", langCode);
  }

  /**
   * Sets the page number to query for this SearchForm. This is an optional method.
   */
  page(p: number): SearchForm {
    return this.set("page", p);
  }

  /**
   * Remove all the documents except for those after the specified document in the list. This is an optional method.
   */
  after(documentId: string): SearchForm {
    return this.set("after", documentId);
  }

  /**
   * Sets the orderings to query for this SearchForm. This is an optional method.
   */
  orderings(orderings ?: string[]): SearchForm {
    if (!orderings) {
      return this;
    } else {
      return this.set("orderings", `[${orderings.join(",")}]`);
    }
  }

  /**
   * Build the URL to query
   */
  url(): string {
    let url = this.form.action;
    if (this.data) {
      let sep = (url.indexOf('?') > -1 ? '&' : '?');
      for(const key in this.data) {
        if (this.data.hasOwnProperty(key)) {
          const values = this.data[key];
          if (values) {
            for (let i = 0; i < values.length; i++) {
              url += sep + key + '=' + encodeURIComponent(values[i]);
              sep = '&';
            }
          }
        }
      }
    }
    return url;
  }

  /**
   * Submits the query, and calls the callback function.
   */
  submit(callback: (error: Error | null, response: ApiSearchResponse, xhr: any) => void): Promise<ApiSearchResponse> {
    return this.api.request(this.url(), callback);
  }
}
