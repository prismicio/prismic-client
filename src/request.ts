// Number of maximum simultaneous connections to the prismic server
const MAX_CONNECTIONS: number = 20;
// Number of requests currently running (capped by MAX_CONNECTIONS)
let running: number = 0;
// Requests in queue
const queue: any[]  = [];

export type RequestCallback<T> = (error: Error | null, result: T | null, xhr?: any) => void;

interface RequestCallbackSuccess {
  result: any;
  xhr: any;
  ttl?: number;
}

interface RequestCallbackFailure {
  error: Error;
}

interface NodeRequestInit extends RequestInit {
  agent?: any;
}

function fetchRequest(
  url: string,
  onSuccess: (_: RequestCallbackSuccess) => void,
  onError: (_: RequestCallbackFailure) => void,
  options?: RequestHandlerOption,
): any {

  const fetchOptions = {
    headers: {
      Accept: 'application/json',
    },
  } as NodeRequestInit;

  if (options && options.proxyAgent) {
    fetchOptions.agent = options.proxyAgent;
  }

  return fetch(url, fetchOptions).then((response) => {
    if (~~(response.status / 100 !== 2)) {
      const e: any = new Error(`Unexpected status code [${response.status}] on URL ${url}`);
      e.status = response.status;
      throw e;
    } else {
      return response.json().then((json) => {
        return {
          response,
          json,
        };
      });
    }
  }).then((next: any) => {
    const response = next.response;
    const json = next.json;
    const cacheControl = response.headers.get('cache-control');
    const parsedCacheControl = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
    const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
    onSuccess({ ttl, result: json, xhr: response } as RequestCallbackSuccess);
  }).catch((error: Error) => {
    onError({ error } as RequestCallbackFailure);
  });
}

export interface RequestHandler {
  request<T>(url: String, cb: RequestCallback<T>): void;
}

function processQueue(options?: RequestHandlerOption) {
  if (queue.length === 0 || running >= MAX_CONNECTIONS) {
    return;
  }

  running++;

  const next = queue.shift();

  const onSuccess = ({ result, xhr, ttl }: RequestCallbackSuccess) => {
    running--;
    next.callback(null, result, xhr, ttl);
    processQueue(options);
  };

  const onError = ({ error }: RequestCallbackFailure) => {
    next.callback(error);
    processQueue(options);
  };

  fetchRequest(next.url, onSuccess, onError);
}

export interface RequestHandlerOption {
  proxyAgent: any;
}

export class DefaultRequestHandler implements RequestHandler {

  options?: RequestHandlerOption;

  constructor(options?: RequestHandlerOption) {
    this.options = options;
  }

  request<T>(url: String, cb: RequestCallback<T>): void {
    queue.push({
      url,
      callback: cb,
    });
    processQueue(this.options);
  }
}
