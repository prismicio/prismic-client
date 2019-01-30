import Api from './Api';
import ResolvedApi from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import HttpClient from './HttpClient';
import { RequestCallback } from './request';

export type Fields = { [key: string]: any };

export interface Form {
  fields: Fields;
  action: string;
  name: string;
  rel: string;
  form_method: string;
  enctype: string;
}

export class LazySearchForm {
  id: string;
  fields: Fields;
  api: Api;

  constructor(id: string, api: Api) {
    this.id = id;
    this.api = api;
    this.fields = {};
  }

  set(key: string, value: any): LazySearchForm {
    this.fields[key] = value;
    return this;
  }

  ref(ref: string): LazySearchForm {
    return this.set('ref', ref);
  }

  query(query: string | string[]): LazySearchForm {
    return this.set('q', query);
  }

  pageSize(size: number): LazySearchForm {
    return this.set('pageSize', size);
  }

  fetch(fields: string | string[]): LazySearchForm {
    console.warn('Warning: Using Fetch is deprecated. Use the property `graphQuery` instead.');
    return this.set('fetch', fields);
  }

  fetchLinks(fields: string | string[]): LazySearchForm {
    console.warn('Warning: Using FetchLinks is deprecated. Use the property `graphQuery` instead.');
    return this.set('fetchLinks', fields);
  }

  graphQuery(query: string): LazySearchForm {
    return this.set('graphQuery', query);
  }

  lang(langCode: string): LazySearchForm {
    return this.set('lang', langCode);
  }

  page(p: number): LazySearchForm {
    return this.set('page', p);
  }

  after(documentId: string): LazySearchForm {
    return this.set('after', documentId);
  }

  orderings(orderings?: string[]): LazySearchForm {
    return this.set('orderings', orderings);
  }

  url(): Promise<string> {
    return this.api.get().then((api) => {
      return LazySearchForm.toSearchForm(this, api).url();
    });
  }

  submit(cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    return this.api.get().then((api) => {
      return LazySearchForm.toSearchForm(this, api).submit(cb);
    });
  }

  static toSearchForm(lazyForm: LazySearchForm, api: ResolvedApi): SearchForm {
    const form = api.form(lazyForm.id);
    if (form) {
      return Object.keys(lazyForm.fields).reduce((form, fieldKey) => {
        const fieldValue = lazyForm.fields[fieldKey];
        if (fieldKey === 'q') {
          return form.query(fieldValue);
        } else if (fieldKey === 'pageSize') {
          return form.pageSize(fieldValue);
        } else if (fieldKey === 'fetch') {
          return form.fetch(fieldValue);
        } else if (fieldKey === 'fetchLinks') {
          return form.fetchLinks(fieldValue);
        } else if (fieldKey === 'graphQuery') {
          return form.graphQuery(fieldValue);
        } else if (fieldKey === 'lang') {
          return form.lang(fieldValue);
        } else if (fieldKey === 'page') {
          return form.page(fieldValue);
        } else if (fieldKey === 'after') {
          return form.after(fieldValue);
        } else if (fieldKey === 'orderings') {
          return form.orderings(fieldValue);
        } else {
          return form.set(fieldKey, fieldValue);
        }
      }, form);
    } else {
      throw new Error(`Unable to access to form ${lazyForm.id}`);
    }
  }
}

export class SearchForm {
  httpClient: HttpClient;
  form: Form;
  data: any;

  constructor(form: Form, httpClient: HttpClient) {
    this.httpClient = httpClient;
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
    if (!fieldDesc) throw new Error('Unknown field ' + field);
    const checkedValue = value === '' || value === undefined ? null : value;
    let values = this.data[field] || [];
    if (fieldDesc.multiple) {
      values = checkedValue ? values.concat([checkedValue]) : values;
    } else {
      values = checkedValue ? [checkedValue] : values;
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
    return this.set('ref', ref);
  }

  /**
   * Sets a predicate-based query for this SearchForm. This is where you
   * paste what you compose in your prismic.io API browser.
   */
  query(query: string | string[]): SearchForm {
    if (typeof query === 'string') {
      return this.query([query]);
    } else if (Array.isArray(query)) {
      return this.set('q', `[${query.join('')}]`);
    } else {
      throw new Error(`Invalid query : ${query}`);
    }
  }

  /**
   * Sets a page size to query for this SearchForm. This is an optional method.
   *
   * @param {number} size - The page size
   * @returns {SearchForm} - The SearchForm itself
   */
  pageSize(size: number): SearchForm {
    return this.set('pageSize', size);
  }

  /**
   * Restrict the results document to the specified fields
   */
  fetch(fields: string | string[]): SearchForm {
    console.warn('Warning: Using Fetch is deprecated. Use the property `graphQuery` instead.');
    const strFields = Array.isArray(fields) ? fields.join(',') : fields;
    return this.set('fetch', strFields);
  }

  /**
   * Include the requested fields in the DocumentLink instances in the result
   */
  fetchLinks(fields: string | string[]): SearchForm {
    console.warn('Warning: Using FetchLinks is deprecated. Use the property `graphQuery` instead.');
    const strFields = Array.isArray(fields) ? fields.join(',') : fields;
    return this.set('fetchLinks', strFields);
  }

  /**
   * Sets the graphquery to query for this SearchForm. This is an optional method.
   */
  graphQuery(query: string): SearchForm {
    return this.set('graphQuery', query);
  }

  /**
   * Sets the language to query for this SearchForm. This is an optional method.
   */
  lang(langCode: string): SearchForm {
    return this.set('lang', langCode);
  }

  /**
   * Sets the page number to query for this SearchForm. This is an optional method.
   */
  page(p: number): SearchForm {
    return this.set('page', p);
  }

  /**
   * Remove all the documents except for those after the specified document in the list. This is an optional method.
   */
  after(documentId: string): SearchForm {
    return this.set('after', documentId);
  }

  /**
   * Sets the orderings to query for this SearchForm. This is an optional method.
   */
  orderings(orderings ?: string[]): SearchForm {
    if (!orderings) {
      return this;
    } else {
      return this.set('orderings', `[${orderings.join(',')}]`);
    }
  }

  /**
   * Build the URL to query
   */
  url(): string {
    let url = this.form.action;
    if (this.data) {
      let sep = (url.indexOf('?') > -1 ? '&' : '?');
      for (const key in this.data) {
        if  (this.data.hasOwnProperty(key)) {
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
  submit(cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    return this.httpClient.cachedRequest<ApiSearchResponse>(this.url()).then((response) => {
      cb && cb(null, response);
      return response;
    }).catch((error) => {
      cb && cb(error);
      throw error;
    });
  }
}
