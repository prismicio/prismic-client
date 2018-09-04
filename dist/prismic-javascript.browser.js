(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.PrismicJS = {})));
}(this, (function (exports) { 'use strict';

    class Variation {
        constructor(data) {
            this.data = {};
            this.data = data;
        }
        id() {
            return this.data.id;
        }
        ref() {
            return this.data.ref;
        }
        label() {
            return this.data.label;
        }
    }
    class Experiment {
        constructor(data) {
            this.data = {};
            this.data = data;
            this.variations = (data.variations || []).map((v) => {
                return new Variation(v);
            });
        }
        id() {
            return this.data.id;
        }
        googleId() {
            return this.data.googleId;
        }
        name() {
            return this.data.name;
        }
    }
    class Experiments {
        constructor(data) {
            if (data) {
                this.drafts = (data.drafts || []).map((exp) => {
                    return new Experiment(exp);
                });
                this.running = (data.running || []).map((exp) => {
                    return new Experiment(exp);
                });
            }
        }
        current() {
            if (this.running.length > 0) {
                return this.running[0];
            }
            else {
                return null;
            }
        }
        refFromCookie(cookie) {
            if (!cookie || cookie.trim() === '')
                return null;
            const splitted = cookie.trim().split(' ');
            if (splitted.length < 2)
                return null;
            const expId = splitted[0];
            const varIndex = parseInt(splitted[1], 10);
            const exp = this.running.filter((exp) => {
                return exp.googleId() === expId && exp.variations.length > varIndex;
            })[0];
            return exp ? exp.variations[varIndex].ref() : null;
        }
    }

    class LazySearchForm {
        constructor(id, api) {
            this.id = id;
            this.api = api;
            this.fields = {};
        }
        set(key, value) {
            this.fields[key] = value;
            return this;
        }
        ref(ref) {
            return this.set('ref', ref);
        }
        query(query) {
            return this.set('q', query);
        }
        pageSize(size) {
            return this.set('pageSize', size);
        }
        fetch(fields) {
            return this.set('fetch', fields);
        }
        fetchLinks(fields) {
            return this.set('fetchLinks', fields);
        }
        lang(langCode) {
            return this.set('lang', langCode);
        }
        page(p) {
            return this.set('page', p);
        }
        after(documentId) {
            return this.set('after', documentId);
        }
        orderings(orderings) {
            return this.set('orderings', orderings);
        }
        url() {
            return this.api.get().then((api) => {
                return LazySearchForm.toSearchForm(this, api).url();
            });
        }
        submit(cb) {
            return this.api.get().then((api) => {
                return LazySearchForm.toSearchForm(this, api).submit(cb);
            });
        }
        static toSearchForm(lazyForm, api) {
            const form = api.form(lazyForm.id);
            if (form) {
                return Object.keys(lazyForm.fields).reduce((form, fieldKey) => {
                    const fieldValue = lazyForm.fields[fieldKey];
                    if (fieldKey === 'q') {
                        return form.query(fieldValue);
                    }
                    else if (fieldKey === 'pageSize') {
                        return form.pageSize(fieldValue);
                    }
                    else if (fieldKey === 'fetch') {
                        return form.fetch(fieldValue);
                    }
                    else if (fieldKey === 'fetchLinks') {
                        return form.fetchLinks(fieldValue);
                    }
                    else if (fieldKey === 'lang') {
                        return form.lang(fieldValue);
                    }
                    else if (fieldKey === 'page') {
                        return form.page(fieldValue);
                    }
                    else if (fieldKey === 'after') {
                        return form.after(fieldValue);
                    }
                    else if (fieldKey === 'orderings') {
                        return form.orderings(fieldValue);
                    }
                    else {
                        return form.set(fieldKey, fieldValue);
                    }
                }, form);
            }
            else {
                throw new Error(`Unable to access to form ${lazyForm.id}`);
            }
        }
    }
    class SearchForm {
        constructor(form, httpClient) {
            this.httpClient = httpClient;
            this.form = form;
            this.data = {};
            for (const field in form.fields) {
                if (form.fields[field]['default']) {
                    this.data[field] = [form.fields[field]['default']];
                }
            }
        }
        set(field, value) {
            const fieldDesc = this.form.fields[field];
            if (!fieldDesc)
                throw new Error('Unknown field ' + field);
            const checkedValue = value === '' || value === undefined ? null : value;
            let values = this.data[field] || [];
            if (fieldDesc.multiple) {
                values = checkedValue ? values.concat([checkedValue]) : values;
            }
            else {
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
        ref(ref) {
            return this.set('ref', ref);
        }
        /**
         * Sets a predicate-based query for this SearchForm. This is where you
         * paste what you compose in your prismic.io API browser.
         */
        query(query) {
            if (typeof query === 'string') {
                return this.query([query]);
            }
            else if (query instanceof Array) {
                return this.set('q', `[${query.join('')}]`);
            }
            else {
                throw new Error(`Invalid query : ${query}`);
            }
        }
        /**
         * Sets a page size to query for this SearchForm. This is an optional method.
         *
         * @param {number} size - The page size
         * @returns {SearchForm} - The SearchForm itself
         */
        pageSize(size) {
            return this.set('pageSize', size);
        }
        /**
         * Restrict the results document to the specified fields
         */
        fetch(fields) {
            const strFields = fields instanceof Array ? fields.join(',') : fields;
            return this.set('fetch', strFields);
        }
        /**
         * Include the requested fields in the DocumentLink instances in the result
         */
        fetchLinks(fields) {
            const strFields = fields instanceof Array ? fields.join(',') : fields;
            return this.set('fetchLinks', strFields);
        }
        /**
         * Sets the language to query for this SearchForm. This is an optional method.
         */
        lang(langCode) {
            return this.set('lang', langCode);
        }
        /**
         * Sets the page number to query for this SearchForm. This is an optional method.
         */
        page(p) {
            return this.set('page', p);
        }
        /**
         * Remove all the documents except for those after the specified document in the list. This is an optional method.
         */
        after(documentId) {
            return this.set('after', documentId);
        }
        /**
         * Sets the orderings to query for this SearchForm. This is an optional method.
         */
        orderings(orderings) {
            if (!orderings) {
                return this;
            }
            else {
                return this.set('orderings', `[${orderings.join(',')}]`);
            }
        }
        /**
         * Build the URL to query
         */
        url() {
            let url = this.form.action;
            if (this.data) {
                let sep = (url.indexOf('?') > -1 ? '&' : '?');
                for (const key in this.data) {
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
        submit(cb) {
            return this.httpClient.cachedRequest(this.url()).then((response) => {
                cb && cb(null, response);
                return response;
            }).catch((error) => {
                cb && cb(error);
                throw error;
            });
        }
    }

    const OPERATOR = {
        at: 'at',
        not: 'not',
        missing: 'missing',
        has: 'has',
        any: 'any',
        in: 'in',
        fulltext: 'fulltext',
        similar: 'similar',
        numberGt: 'number.gt',
        numberLt: 'number.lt',
        numberInRange: 'number.inRange',
        dateBefore: 'date.before',
        dateAfter: 'date.after',
        dateBetween: 'date.between',
        dateDayOfMonth: 'date.day-of-month',
        dateDayOfMonthAfter: 'date.day-of-month-after',
        dateDayOfMonthBefore: 'date.day-of-month-before',
        dateDayOfWeek: 'date.day-of-week',
        dateDayOfWeekAfter: 'date.day-of-week-after',
        dateDayOfWeekBefore: 'date.day-of-week-before',
        dateMonth: 'date.month',
        dateMonthBefore: 'date.month-before',
        dateMonthAfter: 'date.month-after',
        dateYear: 'date.year',
        dateHour: 'date.hour',
        dateHourBefore: 'date.hour-before',
        dateHourAfter: 'date.hour-after',
        GeopointNear: 'geopoint.near',
    };
    function encode(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        else if (typeof value === 'number') {
            return value.toString();
        }
        else if (value instanceof Date) {
            return value.getTime().toString();
        }
        else if (value instanceof Array) {
            return `[${value.map(v => encode(v)).join(',')}]`;
        }
        else {
            throw new Error(`Unable to encode ${value} of type ${typeof value}`);
        }
    }
    const geopoint = {
        near(fragment, latitude, longitude, radius) {
            return `[${OPERATOR.GeopointNear}(${fragment}, ${latitude}, ${longitude}, ${radius})]`;
        },
    };
    const date = {
        before(fragment, before) {
            return `[${OPERATOR.dateBefore}(${fragment}, ${encode(before)})]`;
        },
        after(fragment, after) {
            return `[${OPERATOR.dateAfter}(${fragment}, ${encode(after)})]`;
        },
        between(fragment, before, after) {
            return `[${OPERATOR.dateBetween}(${fragment}, ${encode(before)}, ${encode(after)})]`;
        },
        dayOfMonth(fragment, day) {
            return `[${OPERATOR.dateDayOfMonth}(${fragment}, ${day})]`;
        },
        dayOfMonthAfter(fragment, day) {
            return `[${OPERATOR.dateDayOfMonthAfter}(${fragment}, ${day})]`;
        },
        dayOfMonthBefore(fragment, day) {
            return `[${OPERATOR.dateDayOfMonthBefore}(${fragment}, ${day})]`;
        },
        dayOfWeek(fragment, day) {
            return `[${OPERATOR.dateDayOfWeek}(${fragment}, ${encode(day)})]`;
        },
        dayOfWeekAfter(fragment, day) {
            return `[${OPERATOR.dateDayOfWeekAfter}(${fragment}, ${encode(day)})]`;
        },
        dayOfWeekBefore(fragment, day) {
            return `[${OPERATOR.dateDayOfWeekBefore}(${fragment}, ${encode(day)})]`;
        },
        month(fragment, month) {
            return `[${OPERATOR.dateMonth}(${fragment}, ${encode(month)})]`;
        },
        monthBefore(fragment, month) {
            return `[${OPERATOR.dateMonthBefore}(${fragment}, ${encode(month)})]`;
        },
        monthAfter(fragment, month) {
            return `[${OPERATOR.dateMonthAfter}(${fragment}, ${encode(month)})]`;
        },
        year(fragment, year) {
            return `[${OPERATOR.dateYear}(${fragment}, ${year})]`;
        },
        hour(fragment, hour) {
            return `[${OPERATOR.dateHour}(${fragment}, ${hour})]`;
        },
        hourBefore(fragment, hour) {
            return `[${OPERATOR.dateHourBefore}(${fragment}, ${hour})]`;
        },
        hourAfter(fragment, hour) {
            return `[${OPERATOR.dateHourAfter}(${fragment}, ${hour})]`;
        },
    };
    const number = {
        gt(fragment, value) {
            return `[${OPERATOR.numberGt}(${fragment}, ${value})]`;
        },
        lt(fragment, value) {
            return `[${OPERATOR.numberLt}(${fragment}, ${value})]`;
        },
        inRange(fragment, before, after) {
            return `[${OPERATOR.numberInRange}(${fragment}, ${before}, ${after})]`;
        },
    };
    var Predicates = {
        at(fragment, value) {
            return `[${OPERATOR.at}(${fragment}, ${encode(value)})]`;
        },
        not(fragment, value) {
            return `[${OPERATOR.not}(${fragment}, ${encode(value)})]`;
        },
        missing(fragment) {
            return `[${OPERATOR.missing}(${fragment})]`;
        },
        has(fragment) {
            return `[${OPERATOR.has}(${fragment})]`;
        },
        any(fragment, values) {
            return `[${OPERATOR.any}(${fragment}, ${encode(values)})]`;
        },
        in(fragment, values) {
            return `[${OPERATOR.in}(${fragment}, ${encode(values)})]`;
        },
        fulltext(fragment, value) {
            return `[${OPERATOR.fulltext}(${fragment}, ${encode(value)})]`;
        },
        similar(documentId, maxResults) {
            return `[${OPERATOR.similar}("${documentId}", ${maxResults})]`;
        },
        date,
        dateBefore: date.before,
        dateAfter: date.after,
        dateBetween: date.between,
        dayOfMonth: date.dayOfMonth,
        dayOfMonthAfter: date.dayOfMonthAfter,
        dayOfMonthBefore: date.dayOfMonthBefore,
        dayOfWeek: date.dayOfWeek,
        dayOfWeekAfter: date.dayOfWeekAfter,
        dayOfWeekBefore: date.dayOfWeekBefore,
        month: date.month,
        monthBefore: date.monthBefore,
        monthAfter: date.monthAfter,
        year: date.year,
        hour: date.hour,
        hourBefore: date.hourBefore,
        hourAfter: date.hourAfter,
        number,
        gt: number.gt,
        lt: number.lt,
        inRange: number.inRange,
        near: geopoint.near,
        geopoint,
    };

    // Some portions of code from https://github.com/jshttp/cookie
    var decode = decodeURIComponent;
    function tryDecode(str, decode) {
        try {
            return decode(str);
        }
        catch (e) {
            return str;
        }
    }
    function parse(str, options) {
        if (typeof str !== 'string') {
            throw new TypeError('argument str must be a string');
        }
        var obj = {};
        var opt = options || {};
        var pairs = str.split(/; */);
        var dec = opt.decode || decode;
        pairs.forEach(function (pair) {
            var eq_idx = pair.indexOf('=');
            // skip things that don't look like key=value
            if (eq_idx < 0) {
                return;
            }
            var key = pair.substr(0, eq_idx).trim();
            var val = pair.substr(++eq_idx, pair.length).trim();
            // quoted values
            if ('"' == val[0]) {
                val = val.slice(1, -1);
            }
            // only assign once
            if (undefined == obj[key]) {
                obj[key] = tryDecode(val, dec);
            }
        });
        return obj;
    }
    var Cookies = { parse };

    const PREVIEW_COOKIE = 'io.prismic.preview';
    const EXPERIMENT_COOKIE = 'io.prismic.experiment';
    class ResolvedApi {
        constructor(data, httpClient, options) {
            this.data = data;
            this.masterRef = data.refs.filter(ref => ref.isMasterRef)[0];
            this.experiments = new Experiments(data.experiments);
            this.bookmarks = data.bookmarks;
            this.httpClient = httpClient;
            this.options = options;
            this.refs = data.refs;
            this.tags = data.tags;
            this.types = data.types;
        }
        /**
         * Returns a useable form from its id, as described in the RESTful description of the API.
         * For instance: api.form("everything") works on every repository (as "everything" exists by default)
         * You can then chain the calls: api.form("everything").query('[[:d = at(document.id, "UkL0gMuvzYUANCpf")]]').ref(ref).submit()
         */
        form(formId) {
            const form = this.data.forms[formId];
            if (form) {
                return new SearchForm(form, this.httpClient);
            }
            return null;
        }
        everything() {
            const f = this.form('everything');
            if (!f)
                throw new Error('Missing everything form');
            return f;
        }
        /**
         * The ID of the master ref on this prismic.io API.
         * Do not use like this: searchForm.ref(api.master()).
         * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
         */
        master() {
            return this.masterRef.ref;
        }
        /**
         * Returns the ref ID for a given ref's label.
         * Do not use like this: searchForm.ref(api.ref("Future release label")).
         * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
         */
        ref(label) {
            const ref = this.data.refs.filter(ref => ref.label === label)[0];
            return ref ? ref.ref : null;
        }
        currentExperiment() {
            return this.experiments.current();
        }
        /**
         * Query the repository
         */
        query(q, optionsOrCallback, cb = () => { }) {
            const { options, callback } = typeof optionsOrCallback === 'function'
                ? { options: {}, callback: optionsOrCallback }
                : { options: optionsOrCallback || {}, callback: cb };
            let form = this.everything();
            for (const key in options) {
                form = form.set(key, options[key]);
            }
            if (!options.ref) {
                // Look in cookies if we have a ref (preview or experiment)
                let cookieString = '';
                if (this.options.req) { // NodeJS
                    cookieString = this.options.req.headers['cookie'] || '';
                }
                else if (typeof window !== 'undefined' && window.document) { // Browser
                    cookieString = window.document.cookie || '';
                }
                const cookies = Cookies.parse(cookieString);
                const previewRef = cookies[PREVIEW_COOKIE];
                const experimentRef = this.experiments.refFromCookie(cookies[EXPERIMENT_COOKIE]);
                form = form.ref(previewRef || experimentRef || this.masterRef.ref);
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
        queryFirst(q, optionsOrCallback, cb) {
            const { options, callback } = typeof optionsOrCallback === 'function'
                ? { options: {}, callback: optionsOrCallback }
                : { options: optionsOrCallback || {}, callback: cb || (() => { }) };
            options.page = 1;
            options.pageSize = 1;
            return this.query(q, options).then((response) => {
                const document = response && response.results && response.results[0];
                callback(null, document);
                return document;
            }).catch((error) => {
                callback(error);
                throw error;
            });
        }
        /**
         * Retrieve the document with the given id
         */
        getByID(id, maybeOptions, cb) {
            const options = maybeOptions || {};
            if (!options.lang)
                options.lang = '*';
            return this.queryFirst(Predicates.at('document.id', id), options, cb);
        }
        /**
         * Retrieve multiple documents from an array of id
         */
        getByIDs(ids, maybeOptions, cb) {
            const options = maybeOptions || {};
            if (!options.lang)
                options.lang = '*';
            return this.query(Predicates.in('document.id', ids), options, cb);
        }
        /**
         * Retrieve the document with the given uid
         */
        getByUID(type, uid, maybeOptions, cb) {
            const options = maybeOptions || {};
            if (!options.lang)
                options.lang = '*';
            return this.queryFirst(Predicates.at(`my.${type}.uid`, uid), options, cb);
        }
        /**
         * Retrieve the singleton document with the given type
         */
        getSingle(type, maybeOptions, cb) {
            const options = maybeOptions || {};
            return this.queryFirst(Predicates.at('document.type', type), options, cb);
        }
        /**
         * Retrieve the document with the given bookmark
         */
        getBookmark(bookmark, maybeOptions, cb) {
            const id = this.data.bookmarks[bookmark];
            if (id) {
                return this.getByID(id, maybeOptions, cb);
            }
            else {
                return Promise.reject('Error retrieving bookmarked id');
            }
        }
        previewSession(token, linkResolver, defaultUrl, cb) {
            return this.httpClient.request(token).then((result) => {
                if (!result.mainDocument) {
                    cb && cb(null, defaultUrl);
                    return Promise.resolve(defaultUrl);
                }
                else {
                    return this.getByID(result.mainDocument, { ref: token }).then((document) => {
                        if (!document) {
                            cb && cb(null, defaultUrl);
                            return defaultUrl;
                        }
                        else {
                            const url = linkResolver(document);
                            cb && cb(null, url);
                            return url;
                        }
                    });
                }
            }).catch((error) => {
                cb && cb(error);
                throw error;
            });
        }
    }

    class Variation$1 {
        constructor(data) {
            this.data = {};
            this.data = data;
        }
        id() {
            return this.data.id;
        }
        ref() {
            return this.data.ref;
        }
        label() {
            return this.data.label;
        }
    }
    class Experiment$1 {
        constructor(data) {
            this.data = {};
            this.data = data;
            this.variations = (data.variations || []).map((v) => {
                return new Variation$1(v);
            });
        }
        id() {
            return this.data.id;
        }
        googleId() {
            return this.data.googleId;
        }
        name() {
            return this.data.name;
        }
    }
    class Experiments$1 {
        constructor(data) {
            if (data) {
                this.drafts = (data.drafts || []).map((exp) => {
                    return new Experiment$1(exp);
                });
                this.running = (data.running || []).map((exp) => {
                    return new Experiment$1(exp);
                });
            }
        }
        current() {
            if (this.running.length > 0) {
                return this.running[0];
            }
            else {
                return null;
            }
        }
        refFromCookie(cookie) {
            if (!cookie || cookie.trim() === '')
                return null;
            const splitted = cookie.trim().split(' ');
            if (splitted.length < 2)
                return null;
            const expId = splitted[0];
            const varIndex = parseInt(splitted[1], 10);
            const exp = this.running.filter((exp) => {
                return exp.googleId() === expId && exp.variations.length > varIndex;
            })[0];
            return exp ? exp.variations[varIndex].ref() : null;
        }
    }

    /**
    * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
    * recently used items while discarding least recently used items when its limit
    * is reached.
    *
    * Licensed under MIT. Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>
    * Typescript-ified by Oleksandr Nikitin <https://tvori.info>
    *
    * Illustration of the design:
    *
    *       entry             entry             entry             entry
    *       ______            ______            ______            ______
    *      | head |.newer => |      |.newer => |      |.newer => | tail |
    *      |  A   |          |  B   |          |  C   |          |  D   |
    *      |______| <= older.|______| <= older.|______| <= older.|______|
    *
    *  removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added
    */
    function MakeLRUCache(limit) {
        return new LRUCache(limit);
    }
    function LRUCache(limit) {
        // Current size of the cache. (Read-only).
        this.size = 0;
        // Maximum number of items this cache can hold.
        this.limit = limit;
        this._keymap = {};
    }
    /**
     * Put <value> into the cache associated with <key>. Returns the entry which was
     * removed to make room for the new entry. Otherwise undefined is returned
     * (i.e. if there was enough room already).
     */
    LRUCache.prototype.put = function (key, value) {
        var entry = { key: key, value: value };
        // Note: No protection agains replacing, and thus orphan entries. By design.
        this._keymap[key] = entry;
        if (this.tail) {
            // link previous tail to the new tail (entry)
            this.tail.newer = entry;
            entry.older = this.tail;
        }
        else {
            // we're first in -- yay
            this.head = entry;
        }
        // add new entry to the end of the linked list -- it's now the freshest entry.
        this.tail = entry;
        if (this.size === this.limit) {
            // we hit the limit -- remove the head
            return this.shift();
        }
        else {
            // increase the size counter
            this.size++;
        }
    };
    /**
     * Purge the least recently used (oldest) entry from the cache. Returns the
     * removed entry or undefined if the cache was empty.
     *
     * If you need to perform any form of finalization of purged items, this is a
     * good place to do it. Simply override/replace this function:
     *
     *   var c = new LRUCache(123);
     *   c.shift = function() {
     *     var entry = LRUCache.prototype.shift.call(this);
     *     doSomethingWith(entry);
     *     return entry;
     *   }
     */
    LRUCache.prototype.shift = function () {
        // todo: handle special case when limit == 1
        var entry = this.head;
        if (entry) {
            if (this.head.newer) {
                this.head = this.head.newer;
                this.head.older = undefined;
            }
            else {
                this.head = undefined;
            }
            // Remove last strong reference to <entry> and remove links from the purged
            // entry being returned:
            entry.newer = entry.older = undefined;
            // delete is slow, but we need to do this to avoid uncontrollable growth:
            delete this._keymap[entry.key];
        }
        console.log('purging ', entry.key);
        return entry;
    };
    /**
     * Get and register recent use of <key>. Returns the value associated with <key>
     * or undefined if not in cache.
     */
    LRUCache.prototype.get = function (key, returnEntry) {
        // First, find our cache entry
        var entry = this._keymap[key];
        if (entry === undefined)
            return; // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        if (entry === this.tail) {
            // Already the most recently used entry, so no need to update the list
            return returnEntry ? entry : entry.value;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry.newer) {
            if (entry === this.head)
                this.head = entry.newer;
            entry.newer.older = entry.older; // C <-- E.
        }
        if (entry.older)
            entry.older.newer = entry.newer; // C. --> E
        entry.newer = undefined; // D --x
        entry.older = this.tail; // D. --> E
        if (this.tail)
            this.tail.newer = entry; // E. <-- D
        this.tail = entry;
        return returnEntry ? entry : entry.value;
    };
    // ----------------------------------------------------------------------------
    // Following code is optional and can be removed without breaking the core
    // functionality.
    /**
     * Check if <key> is in the cache without registering recent use. Feasible if
     * you do not want to chage the state of the cache, but only "peek" at it.
     * Returns the entry associated with <key> if found, or undefined if not found.
     */
    LRUCache.prototype.find = function (key) {
        return this._keymap[key];
    };
    /**
     * Update the value of entry with <key>. Returns the old value, or undefined if
     * entry was not in the cache.
     */
    LRUCache.prototype.set = function (key, value) {
        var oldvalue;
        var entry = this.get(key, true);
        if (entry) {
            oldvalue = entry.value;
            entry.value = value;
        }
        else {
            oldvalue = this.put(key, value);
            if (oldvalue)
                oldvalue = oldvalue.value;
        }
        return oldvalue;
    };
    /**
     * Remove entry <key> from cache and return its value. Returns undefined if not
     * found.
     */
    LRUCache.prototype.remove = function (key) {
        var entry = this._keymap[key];
        if (!entry)
            return;
        delete this._keymap[entry.key]; // need to do delete unfortunately
        if (entry.newer && entry.older) {
            // relink the older entry with the newer entry
            entry.older.newer = entry.newer;
            entry.newer.older = entry.older;
        }
        else if (entry.newer) {
            // remove the link to us
            entry.newer.older = undefined;
            // link the newer entry to head
            this.head = entry.newer;
        }
        else if (entry.older) {
            // remove the link to us
            entry.older.newer = undefined;
            // link the newer entry to head
            this.tail = entry.older;
        }
        else { // if(entry.older === undefined && entry.newer === undefined) {
            this.head = this.tail = undefined;
        }
        this.size--;
        return entry.value;
    };
    /** Removes all entries */
    LRUCache.prototype.removeAll = function () {
        // This should be safe, as we never expose strong refrences to the outside
        this.head = this.tail = undefined;
        this.size = 0;
        this._keymap = {};
    };
    /**
     * Return an array containing all keys of entries stored in the cache object, in
     * arbitrary order.
     */
    if (typeof Object.keys === 'function') {
        LRUCache.prototype.keys = function () { return Object.keys(this._keymap); };
    }
    else {
        LRUCache.prototype.keys = function () {
            var keys = [];
            for (var k in this._keymap)
                keys.push(k);
            return keys;
        };
    }
    /**
     * Call `fun` for each entry. Starting with the newest entry if `desc` is a true
     * value, otherwise starts with the oldest (head) enrty and moves towards the
     * tail.
     *
     * `fun` is called with 3 arguments in the context `context`:
     *   `fun.call(context, Object key, Object value, LRUCache self)`
     */
    LRUCache.prototype.forEach = function (fun, context, desc) {
        var entry;
        if (context === true) {
            desc = true;
            context = undefined;
        }
        else if (typeof context !== 'object')
            context = this;
        if (desc) {
            entry = this.tail;
            while (entry) {
                fun.call(context, entry.key, entry.value, this);
                entry = entry.older;
            }
        }
        else {
            entry = this.head;
            while (entry) {
                fun.call(context, entry.key, entry.value, this);
                entry = entry.newer;
            }
        }
    };
    /** Returns a JSON (array) representation */
    //LRUCache.prototype.toJSON = function () {
    //    var s: IEntry[] = [], entry = this.head;
    //    while (entry) {
    //        s.push({ key: entry.key.toJSON(), value: entry.value.toJSON() });
    //        entry = entry.newer;
    //    }
    //    return s;
    //};
    /** Returns a String representation */
    LRUCache.prototype.toString = function () {
        var s = '', entry = this.head;
        while (entry) {
            s += String(entry.key) + ':' + entry.value;
            entry = entry.newer;
            if (entry)
                s += ' < ';
        }
        return s;
    };

    class DefaultApiCache {
        constructor(limit = 1000) {
            this.lru = MakeLRUCache(limit);
        }
        isExpired(key) {
            const value = this.lru.get(key, false);
            if (value) {
                return value.expiredIn !== 0 && value.expiredIn < Date.now();
            }
            else {
                return false;
            }
        }
        get(key, cb) {
            const value = this.lru.get(key, false);
            if (value && !this.isExpired(key)) {
                cb(null, value.data);
            }
            else {
                cb && cb(null);
            }
        }
        set(key, value, ttl, cb) {
            this.lru.remove(key);
            this.lru.put(key, {
                data: value,
                expiredIn: ttl ? (Date.now() + (ttl * 1000)) : 0,
            });
            cb && cb(null);
        }
        remove(key, cb) {
            this.lru.remove(key);
            cb && cb(null);
        }
        clear(cb) {
            this.lru.removeAll();
            cb && cb(null);
        }
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var browser = createCommonjsModule(function (module, exports) {

    module.exports = exports = self.fetch;

    // Needed for TypeScript and Webpack.
    exports.default = self.fetch.bind(self);

    exports.Headers = self.Headers;
    exports.Request = self.Request;
    exports.Response = self.Response;
    });
    var browser_1 = browser.Headers;
    var browser_2 = browser.Request;
    var browser_3 = browser.Response;

    // In the browser, node-fetch exports self.fetch:
    // Number of maximum simultaneous connections to the prismic server
    const MAX_CONNECTIONS = 20;
    // Number of requests currently running (capped by MAX_CONNECTIONS)
    let running = 0;
    // Requests in queue
    const queue = [];
    function fetchRequest(url, options, callback) {
        const fetchOptions = {
            headers: {
                Accept: 'application/json',
            },
        };
        if (options && options.proxyAgent) {
            fetchOptions.agent = options.proxyAgent;
        }
        browser(url, fetchOptions).then((xhr) => {
            if (~~(xhr.status / 100 !== 2)) {
                /**
                 * @description
                 * drain the xhr before throwing an error to prevent memory leaks
                 * @link https://github.com/bitinn/node-fetch/issues/83
                 */
                return xhr.text().then(() => {
                    const e = new Error(`Unexpected status code [${xhr.status}] on URL ${url}`);
                    e.status = xhr.status;
                    throw e;
                });
            }
            else {
                return xhr.json().then((result) => {
                    const cacheControl = xhr.headers.get('cache-control');
                    const parsedCacheControl = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
                    const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
                    callback(null, result, xhr, ttl);
                });
            }
        }).catch(callback);
    }
    function processQueue(options) {
        if (queue.length > 0 && running < MAX_CONNECTIONS) {
            running++;
            const req = queue.shift();
            if (req) {
                fetchRequest(req.url, options, (error, result, xhr, ttl) => {
                    running--;
                    req.callback(error, result, xhr, ttl);
                    processQueue(options);
                });
            }
        }
    }
    class DefaultRequestHandler {
        constructor(options) {
            this.options = options || {};
        }
        request(url, callback) {
            queue.push({ url, callback });
            processQueue(this.options);
        }
    }

    class HttpClient {
        constructor(requestHandler, cache, proxyAgent) {
            this.requestHandler = requestHandler || new DefaultRequestHandler({ proxyAgent });
            this.cache = cache || new DefaultApiCache();
        }
        request(url, callback) {
            return new Promise((resolve, reject) => {
                this.requestHandler.request(url, (err, result, xhr, ttl) => {
                    if (err) {
                        reject(err);
                        callback && callback(err, null, xhr, ttl);
                    }
                    else if (result) {
                        resolve(result);
                        callback && callback(null, result, xhr, ttl);
                    }
                });
            });
        }
        /**
         * Fetch a URL corresponding to a query, and parse the response as a Response object
         */
        cachedRequest(url, maybeOptions) {
            const options = maybeOptions || {};
            const run = (cb) => {
                const cacheKey = options.cacheKey || url;
                this.cache.get(cacheKey, (cacheGetError, cacheGetValue) => {
                    if (cacheGetError || cacheGetValue) {
                        cb(cacheGetError, cacheGetValue);
                    }
                    else {
                        this.request(url, (fetchError, fetchValue, xhr, ttlReq) => {
                            if (fetchError) {
                                cb(fetchError, null);
                            }
                            else {
                                const ttl = ttlReq || options.ttl;
                                if (ttl) {
                                    this.cache.set(cacheKey, fetchValue, ttl, cb);
                                }
                                cb(null, fetchValue);
                            }
                        });
                    }
                });
            };
            return new Promise((resolve, reject) => {
                run((err, value) => {
                    if (err)
                        reject(err);
                    if (value)
                        resolve(value);
                });
            });
        }
    }

    class Api {
        constructor(url, options) {
            this.options = options || {};
            this.url = url;
            if (this.options.accessToken) {
                const accessTokenParam = `access_token=${this.options.accessToken}`;
                this.url += (url.indexOf('?') > -1 ? '&' : '?') + accessTokenParam;
            }
            this.apiDataTTL = this.options.apiDataTTL || 5;
            this.httpClient = new HttpClient(this.options.requestHandler, this.options.apiCache, this.options.proxyAgent);
        }
        /**
         * Fetches data used to construct the api client, from cache if it's
         * present, otherwise from calling the prismic api endpoint (which is
         * then cached).
         */
        get(cb) {
            return this.httpClient.cachedRequest(this.url, { ttl: this.apiDataTTL }).then((data) => {
                const resolvedApi = new ResolvedApi(data, this.httpClient, this.options);
                cb && cb(null, resolvedApi);
                return resolvedApi;
            }).catch((error) => {
                cb && cb(error);
                throw error;
            });
        }
    }

    class DefaultClient {
        constructor(url, options) {
            this.api = new Api(url, options);
        }
        getApi() {
            return this.api.get();
        }
        everything() {
            return this.form('everything');
        }
        form(formId) {
            return new LazySearchForm(formId, this.api);
        }
        query(q, optionsOrCallback, cb) {
            return this.getApi().then(api => api.query(q, optionsOrCallback, cb));
        }
        queryFirst(q, optionsOrCallback, cb) {
            return this.getApi().then(api => api.queryFirst(q, optionsOrCallback, cb));
        }
        getByID(id, options, cb) {
            return this.getApi().then(api => api.getByID(id, options, cb));
        }
        getByIDs(ids, options, cb) {
            return this.getApi().then(api => api.getByIDs(ids, options, cb));
        }
        getByUID(type, uid, options, cb) {
            return this.getApi().then(api => api.getByUID(type, uid, options, cb));
        }
        getSingle(type, options, cb) {
            return this.getApi().then(api => api.getSingle(type, options, cb));
        }
        getBookmark(bookmark, options, cb) {
            return this.getApi().then(api => api.getBookmark(bookmark, options, cb));
        }
        previewSession(token, linkResolver, defaultUrl, cb) {
            return this.getApi().then(api => api.previewSession(token, linkResolver, defaultUrl, cb));
        }
        static getApi(url, options) {
            const api = new Api(url, options);
            return api.get();
        }
    }

    function client(url, options) {
        return new DefaultClient(url, options);
    }
    function getApi(url, options) {
        return DefaultClient.getApi(url, options);
    }
    function api(url, options) {
        return getApi(url, options);
    }

    exports.experimentCookie = EXPERIMENT_COOKIE;
    exports.previewCookie = PREVIEW_COOKIE;
    exports.Predicates = Predicates;
    exports.Experiments = Experiments$1;
    exports.Api = Api;
    exports.client = client;
    exports.getApi = getApi;
    exports.api = api;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=prismic-javascript.browser.js.map
