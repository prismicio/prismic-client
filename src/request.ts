export interface RequestError extends Error {
  status: number;
}

function createError(status: number, message: string): RequestError {
  return {
    message,
    status,
    name: 'prismic-request-error',
  };
}

// Number of maximum simultaneous connections to the prismic server
const MAX_CONNECTIONS: number = 20;
// Number of requests currently running (capped by MAX_CONNECTIONS)
let running: number = 0;
// Requests in queue
const queue: any[]  = [];

interface RequestCallback {}

interface RequestCallbackSuccess extends RequestCallback {
  result: any;
  xhr: any;
  ttl ?: number;
}

interface RequestCallbackFailure extends RequestCallback {
  error: Error
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
    if (~~(response.status / 100 != 2)) {
      throw createError(response.status, "Unexpected status code [" + response.status + "] on URL " + url);
    } else {
      return response.json().then(function(json) {
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
    const parsedCacheControl: string[] | null = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
    const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
    onSuccess({result: json, xhr: response, ttl} as RequestCallbackSuccess);
  }).catch((error: Error) => {
    onError({ error } as RequestCallbackFailure);
  });
}

export interface RequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void
}

function processQueue(options?: RequestHandlerOption) {
  if (queue.length === 0 || running >= MAX_CONNECTIONS) {
    return;
  }
  running++;

  const next = queue.shift();

  fetchRequest(
    next.url,
    ({ result, xhr, ttl }: RequestCallbackSuccess) => {
      running--;
      next.callback(null, result, xhr, ttl);
      processQueue(options);
    },
    ({ error }: RequestCallbackFailure) => {
      next.callback(error);
      processQueue(options);
    },
    options,
  );
}

export interface RequestHandlerOption {
  proxyAgent: any;
}

export class DefaultRequestHandler implements RequestHandler {

  options?: RequestHandlerOption;

  constructor(options?: RequestHandlerOption) {
    this.options = options;
  }

  request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void {
    queue.push({
      url,
      callback: cb,
    });
    processQueue(this.options);
  }
}
