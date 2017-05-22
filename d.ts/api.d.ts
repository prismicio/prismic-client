import { IExperiments, IExperiment } from '@root/experiments';
import { IRequestHandler } from '@root/request';
import { IDocument } from '@root/documents';
import { IApiCache } from '@root/cache';
export declare const PreviewCookie = "io.prismic.preview";
export declare const ExperimentCookie = "io.prismic.experiment";
export interface IRef {
    ref: string;
    label: string;
    isMaster: string;
    scheduledAt: string;
    id: string;
}
export declare class Ref implements IRef {
    ref: string;
    label: string;
    isMaster: string;
    scheduledAt: string;
    id: string;
    constructor(ref: string, label: string, isMaster: string, scheduledAt: string, id: string);
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
    getField(field: string): IField | undefined;
    getFieldSafe(field: string): IField;
}
export declare class Form implements IForm {
    fields: any;
    action: string;
    name: string;
    rel: string;
    form_method: string;
    enctype: string;
    constructor(fields: any, action: string, name: string, rel: string, form_method: string, enctype: string);
    getField(field: string): IField | undefined;
    getFieldSafe(field: string): IField;
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
    orderings(orderings?: string[]): ISearchForm;
    submit(callback: (error: Error | null, response: IApiResponse, xhr: any) => void): any;
}
export declare class SearchForm implements ISearchForm {
    api: IApi;
    form: IForm;
    data: any;
    constructor(api: IApi, form: IForm, data: any);
    set(field: string, value: any): ISearchForm;
    /**
     * Sets a ref to query on for this SearchForm. This is a mandatory
     * method to call before calling submit(), and api.form('everything').submit()
     * will not work.
     */
    ref(ref: string): ISearchForm;
    /**
     * Sets a predicate-based query for this SearchForm. This is where you
     * paste what you compose in your prismic.io API browser.
     */
    query(query: string | string[]): ISearchForm;
    /**
     * Sets a page size to query for this SearchForm. This is an optional method.
     *
     * @param {number} size - The page size
     * @returns {SearchForm} - The SearchForm itself
     */
    pageSize(size: number): ISearchForm;
    /**
     * Restrict the results document to the specified fields
     */
    fetch(fields: string | string[]): ISearchForm;
    /**
     * Include the requested fields in the DocumentLink instances in the result
     */
    fetchLinks(fields: string | string[]): ISearchForm;
    /**
     * Sets the language to query for this SearchForm. This is an optional method.
     */
    lang(langCode: string): ISearchForm;
    /**
     * Sets the page number to query for this SearchForm. This is an optional method.
     */
    page(p: number): ISearchForm;
    /**
     * Sets the orderings to query for this SearchForm. This is an optional method.
     */
    orderings(orderings?: string[]): ISearchForm;
    /**
     * Submits the query, and calls the callback function.
     */
    submit(callback: (error: Error | null, response: IApiResponse, xhr: any) => void): any;
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
export declare class ApiResponse {
    page: number;
    results_per_page: number;
    results_size: number;
    total_results_size: number;
    total_pages: number;
    next_page: string;
    prev_page: string;
    results: IDocument[];
    constructor(page: number, results_per_page: number, results_size: number, total_results_size: number, total_pages: number, next_page: string, prev_page: string, results: IDocument[]);
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
export declare class Api implements IApi {
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
    constructor(url: string, options: IApiOptions);
    /**
     * Fetches data used to construct the api client, from cache if it's
     * present, otherwise from calling the prismic api endpoint (which is
     * then cached).
     */
    get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<IApi>;
    /**
     * Cleans api data from the cache and fetches an up to date copy.
     *
     * @param {function} callback - Optional callback function that is called after the data has been refreshed
     * @returns {Promise}
     */
    refresh(callback: (err: Error | null | undefined, data: any, xhr: any) => void): PromiseLike<IApiResponse>;
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
    form(formId: string): ISearchForm | null;
    everything(): ISearchForm;
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
    currentExperiment(): IExperiment | null;
    quickRoutesEnabled(): boolean;
    /**
     * Retrieve quick routes definitions
     */
    getQuickRoutes(callback: (err: Error, data: any, xhr: any) => void): Promise<any>;
    /**
     * Query the repository
     */
    query(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<IApiResponse>;
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
    getByIDs(ids: string[], options: any, callback: (err: Error | null, response?: any) => void): Promise<IApiResponse>;
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
    request(url: string, callback: (err: Error | null, results: IApiResponse | null, xhr?: any) => void): PromiseLike<IApiResponse>;
    getNextPage(nextPage: number, callback: (err: Error | null, results: IApiResponse | null, xhr?: any) => void): PromiseLike<IApiResponse>;
    /**
     * JSON documents to Response object
     */
    response(documents: any): ApiResponse;
}
