import Predicates from './predicates';
import { Experiment, Experiments } from './experiments';
import { RequestHandler, DefaultRequestHandler } from './request';
import { Document } from './documents';
import { ApiCache, DefaultApiCache } from './cache';
import Cookies from './cookies';

export const PreviewCookie = "io.prismic.preview";
export const ExperimentCookie = "io.prismic.experiment";

export interface Ref {
  ref: string;
  label: string;
  isMasterRef: string;
  scheduledAt: string;
  id: string;
}

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
  api: Api;
  form: Form;
  data: any;

  constructor(api: Api, form: Form, data: any) {
    this.api = api;
    this.form = form;
    this.data = data || {};

    for(var field in form.fields) {
      if(form.fields[field]['default']) {
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
  submit(callback: (error: Error | null, response: ApiResponse, xhr: any) => void): any {
    return this.api.request(this.url(), callback);
  }
}

export interface ApiResponse {
  page: number;
  results_per_page: number;
  results_size: number;
  total_results_size: number;
  total_pages: number;
  next_page: string;
  prev_page: string;
  results: Document[];
}

export interface ApiOptions {
  accessToken?: string;
  complete?: (err: Error | null, value?: any, xhr?: any) => void;
  requestHandler?: RequestHandler;
  req?: any;
  apiCache?: ApiCache;
  apiDataTTL?: number;
}

export class Api {
  url: string;
  accessToken?: string;
  req: any;
  apiCacheKey: string;
  apiCache: ApiCache;
  apiDataTTL: number;
  requestHandler: RequestHandler;
  experiments: Experiments;
  bookmarks: { [key: string]: string };
  refs: Ref[];
  types: object;
  tags: string[];
  data: any;
  forms: Form[];
  oauthInitiate: string;
  oauthToken: string;
  quickRoutes: any;

  constructor(url: string, options: ApiOptions) {
    const opts: ApiOptions = options || {};
    this.accessToken = opts.accessToken;
    this.url = url + (this.accessToken ? (url.indexOf('?') > -1 ? '&' : '?') + 'access_token=' + this.accessToken : '');
    this.req = opts.req;
    this.apiCache = opts.apiCache || new DefaultApiCache();
    this.requestHandler = opts.requestHandler || new DefaultRequestHandler();
    this.apiCacheKey = this.url + (this.accessToken ? ('#' + this.accessToken) : '');
    this.apiDataTTL = opts.apiDataTTL || 5;
    return this;
  }
  /**
   * Fetches data used to construct the api client, from cache if it's
   * present, otherwise from calling the prismic api endpoint (which is
   * then cached).
   */
  get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<Api> {
    const cacheKey = this.apiCacheKey;

    return new Promise((resolve, reject) => {
      const cb = (err: Error | null, value?: any, xhr?: any, ttl?: number) => {
        if (callback) callback(err, value, xhr, ttl);
        if (value) resolve(value);
        if (err) reject(err);
      };
      this.apiCache.get(cacheKey, (err: Error | null, value?: any) => {
        if (err || value) {
          cb(err, value);
          return;
        }

        this.requestHandler.request(this.url, (err: Error | null, value?: any, xhr?: any, ttl?: number) => {
          if (err) {
            cb(err, null, xhr, ttl);
            return;
          }

          var parsed = this.parse(value);

          ttl = ttl || this.apiDataTTL;

          this.apiCache.set(cacheKey, parsed, ttl, (err: Error) => {
            cb(err, parsed, xhr, ttl);
          });
        });
      });
    });
  }

  /**
   * Cleans api data from the cache and fetches an up to date copy.
   *
   * @param {function} callback - Optional callback function that is called after the data has been refreshed
   * @returns {Promise}
   */
  refresh(callback: (err: Error | null | undefined, data: any, xhr: any) => void): PromiseLike<ApiResponse> {
    const cacheKey = this.apiCacheKey;

    return new Promise(function(resolve, reject) {
      const cb = (err?: Error | null, value?: any, xhr?: any) => {
        if (callback) callback(err, value, xhr);
        if (value) resolve(value);
        if (err) reject(err);
      };
      this.apiCache.remove(cacheKey, (err: Error) => {
        if (err) { cb(err); return; }

        this.get((err: Error, data: any) => {
          if (err) { cb(err); return; }

          this.data = data;
          this.bookmarks = data.bookmarks;
          this.experiments = new Experiments(data.experiments);

          cb();
        });
      });
    });
  }

  /**
   * Parses and returns the /api document.
   * This is for internal use, from outside this kit, you should call Prismic.Api()
   *
   * @param {string} data - The JSON document responded on the API's endpoint
   * @returns {Api} - The Api object that can be manipulated
   * @private
   */
  parse(data: any): object {
    // Parse the forms
    const forms = Object.keys(data.forms || []).reduce((acc: any, key: string, i: number) => {
      if (data.forms.hasOwnProperty(key)) {
        const form = data.forms[key] as Form;

        if(this.accessToken) {
          form.fields['access_token'] = {};
          form.fields['access_token']['type'] = 'string';
          form.fields['access_token']['default'] = this.accessToken;
        }

        acc[key] = form;
        return acc;
      } else {
        return acc;
      }
    }, {});

    const refs: Ref[] = data.refs || [];

    const master = refs.filter(r => r.isMasterRef)[0];

    const types = data.types;

    const tags = data.tags;

    if (!master) {
      throw ("No master ref.");
    }

    return {
      bookmarks: data.bookmarks || {},
      refs,
      forms,
      master,
      types: types,
      tags,
      experiments: data.experiments,
      oauthInitiate: data['oauth_initiate'],
      oauthToken: data['oauth_token'],
      quickRoutes: data.quickRoutes
    };
  }

  /**
   * Returns a useable form from its id, as described in the RESTful description of the API.
   * For instance: api.form("everything") works on every repository (as "everything" exists by default)
   * You can then chain the calls: api.form("everything").query('[[:d = at(document.id, "UkL0gMuvzYUANCpf")]]').ref(ref).submit()
   */
  form(formId: string): SearchForm | null {
    var form = this.data.forms[formId];
    if(form) {
      return new SearchForm(this, form, {});
    }
    return null;
  }

  everything(): SearchForm {
    const f = this.form("everything");
    if(!f) throw new Error("Missing everything form");
    return f;
  }

  /**
   * The ID of the master ref on this prismic.io API.
   * Do not use like this: searchForm.ref(api.master()).
   * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
   */
  master(): string {
    return this.data.master.ref;
  }

  /**
   * Returns the ref ID for a given ref's label.
   * Do not use like this: searchForm.ref(api.ref("Future release label")).
   * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
   */
  ref(label: string): string | null {
    for(var i=0; i<this.data.refs.length; i++) {
      if(this.data.refs[i].label == label) {
        return this.data.refs[i].ref;
      }
    }
    return null;
  }

  /**
   * The current experiment, or null
   */
  currentExperiment(): Experiment | null {
    return this.experiments.current();
  }

  quickRoutesEnabled(): boolean {
    return this.data.quickRoutes.enabled;
  }

  /**
   * Retrieve quick routes definitions
   */
  getQuickRoutes(callback: (err: Error, data: any, xhr: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestHandler.request(this.data.quickRoutes.url, (err: Error, data: any, xhr: any) => {
        if (callback) callback(err, data, xhr);
        if (err) reject(err);
        if (data) resolve(data);
      });
    });
  }

  /**
   * Query the repository
   */
  query(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<ApiResponse> {
        const {options, callback} = typeof optionsOrCallback === 'function'
      ? {options: {}, callback: optionsOrCallback}
      : {options: optionsOrCallback || {}, callback: cb};

    const opts: any = options;

    var form = this.everything();
    for (var key in opts) {
      form = form.set(key, opts[key]);
    }
    if (!opts['ref']) {
      // Look in cookies if we have a ref (preview or experiment)
      var cookieString = '';
      if (this.req) { // NodeJS
        cookieString = this.req.headers["cookie"] || '';
      } else if (typeof window !== 'undefined' && window.document) { // Browser
        cookieString = window.document.cookie || '';
      }
      var cookies = Cookies.parse(cookieString);
      var previewRef = cookies[PreviewCookie];
      var experimentRef = this.experiments.refFromCookie(cookies[ExperimentCookie]);
      form = form.ref(previewRef || experimentRef || this.master());
    }
    if (q) {
      form.query(q);
    }
    return form.submit(callback);
  }

  /**
   * Retrieve the document returned by the given query
   * @param {string|array|Predicate} the query
   * @param {object} additional parameters. In NodeJS, pass the request as 'req'.
   * @param {function} callback(err, doc)
   */
  queryFirst(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void) {
    const {options, callback} = typeof optionsOrCallback === 'function'
      ? {options: {}, callback: optionsOrCallback}
      : {options: optionsOrCallback || {}, callback: cb};

    const opts: any = options;
    opts.page = 1;
    opts.pageSize = 1;
    return this.query(q, opts, function(err: Error, response: any) {
      if (callback) {
        var result = response && response.results && response.results[0];
        callback(err, result);
      }
    }).then(function(response: any){
      return response && response.results && response.results[0];
    }).catch((e: Error) => {
      console.log(e);
    });
  }

  /**
   * Retrieve the document with the given id
   */
  getByID(id: string, options: any, callback: (err: Error | null, response?: any) => void) {
    options = options || {};
    if(!options.lang) options.lang = '*';
    return this.queryFirst(Predicates.at('document.id', id), options, callback);
  }

  /**
   * Retrieve multiple documents from an array of id
   */
  getByIDs(ids: string[], options: any, callback: (err: Error | null, response?: any) => void) {
    options = options || {};
    if(!options.lang) options.lang = '*';
    return this.query(Predicates.in('document.id', ids), options, callback);
  }

  /**
   * Retrieve the document with the given uid
   */
  getByUID(type: string, uid: string, options: any, callback: (err: Error | null, response?: any) => void) {
    options = options || {};
    if(!options.lang) options.lang = '*';
    return this.queryFirst(Predicates.at(`my.${type}.uid`, uid), options, callback);
  }

  /**
   * Retrieve the singleton document with the given type
   */
  getSingle(type: string, options: any, callback: (err: Error | null, response?: any) => void) {
    return this.queryFirst(Predicates.at('document.type', type), options, callback);
  }

  /**
   * Retrieve the document with the given bookmark
   */
  getBookmark(bookmark: string, options: any, callback: (err: Error | null, response?: any) => void) {
    return new Promise<string>((resolve, reject) => {
      const id = this.bookmarks[bookmark];
      if (id) {
        resolve(id);
      } else {
        const err = new Error("Error retrieving bookmarked id");
        if (callback) callback(err);
        reject(err);
      }
    }).then(id => this.getByID(id, options, callback));
  }

  /**
   * Return the URL to display a given preview
   */
  previewSession(token: string, linkResolver: (ctx: any) => string, defaultUrl: string, callback: (err: Error | null, url?: any, xhr?: any) => void): PromiseLike<string> {
    var api = this;
    return new Promise(function(resolve, reject) {
      var cb = function(err: Error | null, url?: string, xhr?: any) {
        if (callback) callback(err, url, xhr);
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      };
      api.requestHandler.request(token, function(err: Error, result: any, xhr: any) {
        if (err) {
          cb(err, defaultUrl, xhr);
          return;
        }
        try {
          var mainDocumentId = result.mainDocument;
          if (!mainDocumentId) {
            cb(null, defaultUrl, xhr);
          } else {
            api.everything().query(Predicates.at("document.id", mainDocumentId)).ref(token).lang('*').submit(function(err: Error, response: ApiResponse) {
              if (err) {
                cb(err);
              }
              try {
                if (response.results.length === 0) {
                  cb(null, defaultUrl, xhr);
                } else {
                  cb(null, linkResolver(response.results[0]), xhr);
                }
              } catch (e) {
                cb(e);
              }
            });
          }
        } catch (e) {
          cb(e, defaultUrl, xhr);
        }
      });
    });
  }

  /**
   * Fetch a URL corresponding to a query, and parse the response as a Response object
   */
  request(url: string, callback: (err: Error | null, results: ApiResponse | null, xhr?: any) => void): PromiseLike<ApiResponse> {
    var api = this;
    var cacheKey = url + (this.accessToken ? ('#' + this.accessToken) : '');
    var cache = this.apiCache;
    function run(cb: (err: Error | null, results: ApiResponse | null, xhr?: any) => void) {
      cache.get(cacheKey, function (err: Error, value: any) {
        if (err || value) {
          cb(err, value as ApiResponse);
          return;
        }
        api.requestHandler.request(url, function(err: Error, documents: any, xhr: any, ttl?: number) {
          if (err) {
            cb(err, null, xhr);
            return;
          }

          if (ttl) {
            cache.set(cacheKey, documents, ttl, function (err: Error) {
              cb(err, documents as ApiResponse);
            });
          } else {
            cb(null, documents as ApiResponse);
          }
        });
      });
    }
    return new Promise(function(resolve, reject) {
      run(function(err, value, xhr) {
        if (callback) callback(err, value, xhr);
        if (err) reject(err);
        if (value) resolve(value);
      });
    });
  }

  getNextPage(nextPage: string, callback: (err: Error | null, results: ApiResponse | null, xhr?: any) => void) {
    return this.request(nextPage + (this.accessToken ? '&access_token=' + this.accessToken : ''), callback);
  }
}
