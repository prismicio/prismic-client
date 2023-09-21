import crossFetch from 'cross-fetch';

/**
 * The default number of milliseconds to wait before retrying a rate-limited
 * `fetch()` request (429 response code). The default value is only used if the
 * response does not include a `retry-after` header.
 *
 * The API allows up to 200 requests per second.
 */
const DEFUALT_RETRY_AFTER_MS = 1000;

interface NodeRequestInit extends RequestInit {
  agent?: any;
}

function fetchRequest<T>(url: string, options: RequestHandlerOption, callback: RequestCallback<T>): void {

  const fetchOptions = {
    headers: {
      Accept: 'application/json',
    },
  } as NodeRequestInit;

  if (options && options.proxyAgent) {
    fetchOptions.agent = options.proxyAgent;
  }

  // can't use number because of NodeJS globals included
  let timeoutId: any;

  const fetchPromise = crossFetch(url, fetchOptions)

  const promise = options.timeoutInMs ? Promise.race([
    fetchPromise,
    new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`${url} response timeout`)),
        options.timeoutInMs
      )
    }) as Promise<Response>
  ]) : fetchPromise

  promise.then((resp: Response) => {

    clearTimeout(timeoutId);

    if (resp.status === 429) {
      const parsedRetryAfter = Number(resp.headers.get("retry-after"));
      const delay = Number.isNaN(parsedRetryAfter)
        ? DEFUALT_RETRY_AFTER_MS
        : parsedRetryAfter;

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          fetchRequest(url, options, callback)
          resolve()
        }, delay);
      });
    }

    if (~~(resp.status / 100 !== 2)) {
        /**
         * @description
         * drain the resp before throwing an error to prevent memory leaks
         * @link https://github.com/bitinn/node-fetch/issues/83
         */
      return resp.text().then(() => {
        const e: any = new Error(`Unexpected status code [${resp.status}] on URL ${url}`);
        e.status = resp.status;
        throw e;
      });
    }

    return resp.json().then((result) => {
      const cacheControl = resp.headers.get('cache-control');
      const parsedCacheControl = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
      const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;

      callback(null, result, resp, ttl);
    });
  }).catch(err => {
    clearTimeout(timeoutId);
    callback(err);
  });
}

export type RequestCallback<T> = (error: Error | null, result?: T | null, resp?: Response, ttl?: number) => void;

export interface RequestHandlerOption {
  proxyAgent?: any;
  timeoutInMs?: number;
}

export interface RequestHandler {
  request<T>(url: string, cb: RequestCallback<T>): void;
}

export class DefaultRequestHandler implements RequestHandler {

  options: RequestHandlerOption;

  constructor(options?: RequestHandlerOption) {
    this.options = options || {};
  }

  request<T>(url: string, callback: RequestCallback<T>): void {

    fetchRequest(url, this.options, callback);
  }
}
