import { Experiment, Experiments } from './experiments';
import { RequestHandler } from './request';
import { Document } from './documents';
import { ApiCache } from './cache';
export declare const PreviewCookie = "io.prismic.preview";
export declare const ExperimentCookie = "io.prismic.experiment";
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
export declare class SearchForm {
    api: Api;
    form: Form;
    data: any;
    constructor(api: Api, form: Form, data: any);
    set(field: string, value: any): SearchForm;
    /**
     * Sets a ref to query on for this SearchForm. This is a mandatory
     * method to call before calling submit(), and api.form('everything').submit()
     * will not work.
     */
    ref(ref: string): SearchForm;
    /**
     * Sets a predicate-based query for this SearchForm. This is where you
     * paste what you compose in your prismic.io API browser.
     */
    query(query: string | string[]): SearchForm;
    /**
     * Sets a page size to query for this SearchForm. This is an optional method.
     *
     * @param {number} size - The page size
     * @returns {SearchForm} - The SearchForm itself
     */
    pageSize(size: number): SearchForm;
    /**
     * Restrict the results document to the specified fields
     */
    fetch(fields: string | string[]): SearchForm;
    /**
     * Include the requested fields in the DocumentLink instances in the result
     */
    fetchLinks(fields: string | string[]): SearchForm;
    /**
     * Sets the language to query for this SearchForm. This is an optional method.
     */
    lang(langCode: string): SearchForm;
    /**
     * Sets the page number to query for this SearchForm. This is an optional method.
     */
    page(p: number): SearchForm;
    /**
     * Remove all the documents except for those after the specified document in the list. This is an optional method.
     */
    after(documentId: string): SearchForm;
    /**
     * Sets the orderings to query for this SearchForm. This is an optional method.
     */
    orderings(orderings?: string[]): SearchForm;
    /**
     * Build the URL to query
     */
    url(): string;
    /**
     * Submits the query, and calls the callback function.
     */
    submit(callback: (error: Error | null, response: ApiResponse, xhr: any) => void): any;
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
export declare class Api {
    url: string;
    accessToken?: string;
    req: any;
    apiCacheKey: string;
    apiCache: ApiCache;
    apiDataTTL: number;
    requestHandler: RequestHandler;
    experiments: Experiments;
    bookmarks: {
        [key: string]: string;
    };
    refs: Ref[];
    types: object;
    tags: string[];
    data: any;
    forms: Form[];
    oauthInitiate: string;
    oauthToken: string;
    quickRoutes: any;
    constructor(url: string, options: ApiOptions);
    /**
     * Fetches data used to construct the api client, from cache if it's
     * present, otherwise from calling the prismic api endpoint (which is
     * then cached).
     */
    get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<Api>;
    /**
     * Cleans api data from the cache and fetches an up to date copy.
     *
     * @param {function} callback - Optional callback function that is called after the data has been refreshed
     * @returns {Promise}
     */
    refresh(callback: (err: Error | null | undefined, data: any, xhr: any) => void): PromiseLike<ApiResponse>;
    /**
     * Parses and returns the /api document.
     * This is for internal use, from outside this kit, you should call Prismic.Api()
     *
     * @param {string} data - The JSON document responded on the API's endpoint
     * @returns {Api} - The Api object that can be manipulated
     * @private
     */
    parse(data: any): object;
    /**
     * Returns a useable form from its id, as described in the RESTful description of the API.
     * For instance: api.form("everything") works on every repository (as "everything" exists by default)
     * You can then chain the calls: api.form("everything").query('[[:d = at(document.id, "UkL0gMuvzYUANCpf")]]').ref(ref).submit()
     */
    form(formId: string): SearchForm | null;
    everything(): SearchForm;
    /**
     * The ID of the master ref on this prismic.io API.
     * Do not use like this: searchForm.ref(api.master()).
     * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
     */
    master(): string;
    /**
     * Returns the ref ID for a given ref's label.
     * Do not use like this: searchForm.ref(api.ref("Future release label")).
     * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
     */
    ref(label: string): string | null;
    /**
     * The current experiment, or null
     */
    currentExperiment(): Experiment | null;
    quickRoutesEnabled(): boolean;
    /**
     * Retrieve quick routes definitions
     */
    getQuickRoutes(callback: (err: Error, data: any, xhr: any) => void): Promise<any>;
    /**
     * Query the repository
     */
    query(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<ApiResponse>;
    /**
     * Retrieve the document returned by the given query
     * @param {string|array|Predicate} the query
     * @param {object} additional parameters. In NodeJS, pass the request as 'req'.
     * @param {function} callback(err, doc)
     */
    queryFirst(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve the document with the given id
     */
    getByID(id: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve multiple documents from an array of id
     */
    getByIDs(ids: string[], options: any, callback: (err: Error | null, response?: any) => void): Promise<ApiResponse>;
    /**
     * Retrieve the document with the given uid
     */
    getByUID(type: string, uid: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve the singleton document with the given type
     */
    getSingle(type: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve the document with the given bookmark
     */
    getBookmark(bookmark: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Return the URL to display a given preview
     */
    previewSession(token: string, linkResolver: (ctx: any) => string, defaultUrl: string, callback: (err: Error | null, url?: any, xhr?: any) => void): PromiseLike<string>;
    /**
     * Fetch a URL corresponding to a query, and parse the response as a Response object
     */
    request(url: string, callback: (err: Error | null, results: ApiResponse | null, xhr?: any) => void): PromiseLike<ApiResponse>;
    getNextPage(nextPage: string, callback: (err: Error | null, results: ApiResponse | null, xhr?: any) => void): PromiseLike<ApiResponse>;
}
