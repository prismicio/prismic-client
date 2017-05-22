import { Predicates } from '@root/predicates';
import { IExperiments, IExperiment, Experiments } from '@root/experiments';
import { IRequestHandler, DefaultRequestHandler } from '@root/request';
import { IDocument } from '@root/documents';
import { IApiCache, DefaultApiCache } from '@root/cache';
import Cookies from '@root/cookies';
export const PreviewCookie = "io.prismic.preview";
export const ExperimentCookie = "io.prismic.experiment";


export interface IRef {
  ref: string;
  label: string;
  isMaster: string;
  scheduledAt: string;
  id: string;
}

export class Ref implements IRef {
  ref: string;
  label: string;
  isMaster: string;
  scheduledAt: string;
  id: string;

  constructor(ref: string, label: string, isMaster: string, scheduledAt: string, id: string) {
    this.ref = ref;
    this.label = label;
    this.isMaster = isMaster;
    this.scheduledAt = scheduledAt;
    this.id = id;
  }
}


export interface IField {
  [key: string]: string;
  value: string;
}

export interface IForm {
  fields: any;
  action: string;
  name: string;
  rel: string;
  form_method: string;
  enctype: string;

  getField(field: string): IField | undefined
  getFieldSafe(field: string): IField
}

export class Form implements IForm {
  fields: any;
  action: string;
  name: string;
  rel: string;
  form_method: string;
  enctype: string;

  constructor(
    fields: any,
    action: string,
    name: string,
    rel: string,
    form_method: string,
    enctype: string
  ) {
    this.fields = fields;
    this.action = action;
    this.name = name;
    this.rel = rel;
    this.form_method = form_method;
    this.enctype = enctype;
  }

  getField(field: string): IField | undefined {
    return this.fields[field];
  }

  getFieldSafe(field: string): IField {
    const f = this.fields[field];
    if(!f) throw new Error(`Missing field ${f} in form fields ${this.fields}`);
    return f;
  }
}

export interface ISearchForm {
  api: IApi;
  form: IForm;
  data: any;

  set(field: string, value: any): ISearchForm;
  ref(ref: string): ISearchForm;
  query(query: string | string[]): ISearchForm;
  pageSize(size: number): ISearchForm;
  fetch(fields: string | string[]): ISearchForm;
  fetchLinks(fields: string | string[]): ISearchForm;
  lang(langCode: string): ISearchForm;
  page(p: number): ISearchForm;
  orderings(orderings ?: string[]): ISearchForm;
  submit(callback: (error: Error | null, response: IApiResponse, xhr: any) => void): any;
}

export class SearchForm implements ISearchForm {
  api: IApi;
  form: IForm;
  data: any;

  constructor(api: IApi, form: IForm, data: any) {
    this.api = api;
    this.form = form;
    this.data = data || {};

    for(var field in form.fields) {
      if(form.getFieldSafe(field)['default']) {
        this.data[field] = [form.fields[field]['default']];
      }
    }
  }

  set(field: string, value: any): ISearchForm {
    const fieldDesc = this.form.getField(field);

    if(!fieldDesc) throw new Error("Unknown field " + field);

    const checkedValue = value === '' || value === undefined ? null : value;
    let values = this.data[field] || [];
    if(fieldDesc.multiple) {
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
  ref(ref: string): ISearchForm {
    return this.set("ref", ref);
  }

  /**
   * Sets a predicate-based query for this SearchForm. This is where you
   * paste what you compose in your prismic.io API browser.
   */
  query(query: string | string[]): ISearchForm {
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
  pageSize(size: number): ISearchForm {
    return this.set("pageSize", size);
  }

  /**
   * Restrict the results document to the specified fields
   */
  fetch(fields: string | string[]): ISearchForm {
    const strFields = fields instanceof Array ? fields.join(",") : fields;
    return this.set("fetch", strFields);
  }

  /**
   * Include the requested fields in the DocumentLink instances in the result
   */
  fetchLinks(fields: string | string[]): ISearchForm {
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
  page(p: number): ISearchForm {
    return this.set("page", p);
  }

  /**
   * Sets the orderings to query for this SearchForm. This is an optional method.
   */
  orderings(orderings ?: string[]): ISearchForm {
    if (!orderings) {
      return this;
    } else {
      return this.set("orderings", `[${orderings.join(",")}]`);
    }
  }

  /**
   * Submits the query, and calls the callback function.
   */
  submit(callback: (error: Error | null, response: IApiResponse, xhr: any) => void): any {
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
    return this.api.request(url, callback);
  }
}

export interface IApiResponse {
  page: number;
  results_per_page: number;
  results_size: number;
  total_results_size: number;
  total_pages: number;
  next_page: string;
  prev_page: string;
  results: IDocument[];
}

export class ApiResponse {
  page: number;
  results_per_page: number;
  results_size: number;
  total_results_size: number;
  total_pages: number;
  next_page: string;
  prev_page: string;
  results: IDocument[];

  constructor(
    page: number,
    results_per_page: number,
    results_size: number,
    total_results_size: number,
    total_pages: number,
    next_page: string,
    prev_page: string,
    results: IDocument[]
  ) {
    this.page = page;
    this.results_per_page = results_per_page;
    this.results_size = results_size;
    this.total_results_size = total_results_size;
    this.total_pages = total_pages;
    this.next_page = next_page;
    this.prev_page = prev_page;
    this.results = results;
  }
}

export interface IApiOptions {
  accessToken: string;
  complete?: (err: Error | null, value?: any, xhr?: any) => void;
  requestHandler?: IRequestHandler;
  req?: any;
  apiCache?: IApiCache;
  apiDataTTL?: number;
}

export interface IApi {
  url: string;
  accessToken: string;
  req: any;
  apiCacheKey: string;
  apiCache: IApiCache;
  apiDataTTL: number;
  requestHandler: IRequestHandler;
  experiments: IExperiments;
  bookmarks: string[];
  refs: Ref[];
  types: object;
  tags: string[];
  data: any;
  forms: IForm[];
  oauthInitiate: string;
  oauthToken: string;
  quickRoutes: any;

  get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<IApi>;
  request(url: string, callback: (err: Error | null, results: IApiResponse | null, xhr?: any) => void): PromiseLike<IApiResponse>;
  refresh(callback: (err: Error | null | undefined, data: any, xhr: any) => void): PromiseLike<IApiResponse>;
  parse(data: any): object;
  form(formId: string): ISearchForm | null;
  everything(): ISearchForm;
  master(): string;
  ref(label: string): string | null;
  currentExperiment(): IExperiment | null;
  quickRoutesEnabled(): boolean;
  getQuickRoutes(callback: (err: Error, data: any, xhr: any) => void): Promise<any>;
  query(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<IApiResponse>;
}

export class Api implements IApi {
  url: string;
  accessToken: string;
  req: any;
  apiCacheKey: string;
  apiCache: IApiCache;
  apiDataTTL: number;
  requestHandler: IRequestHandler;
  experiments: IExperiments;
  bookmarks: string[];
  refs: Ref[];
  types: object;
  tags: string[];
  data: any;
  forms: IForm[];
  oauthInitiate: string;
  oauthToken: string;
  quickRoutes: any;

  constructor(url: string, options: IApiOptions) {
    const opts: IApiOptions = options || {};
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
  get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<IApi> {
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
  refresh(callback: (err: Error | null | undefined, data: any, xhr: any) => void): PromiseLike<IApiResponse> {
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
        const f = data.forms[key];

        if(this.accessToken) {
          f.fields['access_token'] = {};
          f.fields['access_token']['type'] = 'string';
          f.fields['access_token']['default'] = this.accessToken;
        }

        const form = new Form(
          f.fields,
          f.action,
          f.name,
          f.rel,
          f.form_method,
          f.enctype
        );

        acc[key] = form;
        return acc;
      } else {
        return acc;
      }
    }, {});

    const refs = data.refs.map((r: any) => {
      return new Ref(
        r.ref,
        r.label,
        r.isMasterRef,
        r.scheduledAt,
        r.id
      );
    }) || [];

    const master = refs.filter((r: any) => {
      return r.isMaster === true;
    });

    const types = data.types;

    const tags = data.tags;

    if (master.length === 0) {
      throw ("No master ref.");
    }

    return {
      bookmarks: data.bookmarks || {},
      refs: refs,
      forms: forms,
      master: master[0],
      types: types,
      tags: tags,
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
  form(formId: string): ISearchForm | null {
    var form = this.data.forms[formId];
    if(form) {
      return new SearchForm(this, form, {});
    }
    return null;
  }

  everything(): ISearchForm {
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
  currentExperiment(): IExperiment | null {
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
  query(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<IApiResponse> {
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
    return new Promise(function(resolve, reject) {
      var id = this.bookmarks[bookmark];
      if (id) {
        resolve(id);
      } else {
        var err = new Error("Error retrieving bookmarked id");
        if (callback) callback(err);
        reject(err);
      }
    }).then(function(id) {
      return this.getByID(id, options, callback);
    });
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
            api.everything().query(Predicates.at("document.id", mainDocumentId)).ref(token).lang('*').submit(function(err: Error, response: IApiResponse) {
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
  request(url: string, callback: (err: Error | null, results: IApiResponse | null, xhr?: any) => void): PromiseLike<IApiResponse> {
    var api = this;
    var cacheKey = url + (this.accessToken ? ('#' + this.accessToken) : '');
    var cache = this.apiCache;
    function run(cb: (err: Error | null, results: IApiResponse | null, xhr?: any) => void) {
      cache.get(cacheKey, function (err: Error, value: string) {
        if (err || value) {
          cb(err, api.response(value));
          return;
        }
        api.requestHandler.request(url, function(err: Error, documents: any, xhr: any, ttl?: number) {
          if (err) {
            cb(err, null, xhr);
            return;
          }

          if (ttl) {
            cache.set(cacheKey, documents, ttl, function (err: Error) {
              cb(err, api.response(documents));
            });
          } else {
            cb(null, api.response(documents));
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

  getNextPage(nextPage: number, callback: (err: Error | null, results: IApiResponse | null, xhr?: any) => void) {
    return this.request(nextPage + (this.accessToken ? '&access_token=' + this.accessToken : ''), callback);
  }

  /**
   * JSON documents to Response object
   */
  response(documents: any){
    return new ApiResponse(
      documents.page,
      documents.results_per_page,
      documents.results_size,
      documents.total_results_size,
      documents.total_pages,
      documents.next_page,
      documents.prev_page,
      documents.results || []);
  }
}
