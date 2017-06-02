export interface IRequestError extends Error {
  status: number;
}

function createError(status: number, message: string): IRequestError {
  return {
    name: "prismic-request-error",
    message,
    status: status
  }
}


// Number of maximum simultaneous connections to the prismic server
let MAX_CONNECTIONS: number = 20;
// Number of requests currently running (capped by MAX_CONNECTIONS)
let running: number = 0;
// Requests in queue
let queue: any[]  = [];

interface IRequestCallback {}

interface IRequestCallbackSuccess extends IRequestCallback {
  result: any;
  xhr: any;
  ttl ?: number;
}

interface IRequestCallbackFailure extends IRequestCallback {
  error: Error
}


function fetchRequest(
  url: string,
  onSuccess: (_: IRequestCallbackSuccess) => void,
  onError: (_: IRequestCallbackFailure) => void
): any {
  return fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  }).then(function (response) {
    if (~~(response.status / 100 != 2)) {
      throw createError(response.status, "Unexpected status code [" + response.status + "] on URL " + url);
    } else {
      return response.json().then(function(json) {
        return {
          response: response,
          json: json
        };
      });
    }
  }).then(function(next: any) {
    var response = next.response;
    var json = next.json;
    var cacheControl = response.headers['cache-control'];
    const parsedCacheControl: string[] | null = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
    var ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
    onSuccess({result: json, xhr: response, ttl} as IRequestCallbackSuccess);
  }).catch(function (error: Error) {
    onError({error} as IRequestCallbackFailure);
  });
}

export interface IRequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void
}

function processQueue() {
  if (queue.length === 0 || running >= MAX_CONNECTIONS) {
    return;
  }
  running++;
  var next = queue.shift();
  
  fetchRequest(next.url,
    function({result, xhr, ttl}: IRequestCallbackSuccess) {
      running--;
      next.callback(null, result, xhr, ttl);
      processQueue();
    },
    function({error}: IRequestCallbackFailure) {
      next.callback(error);
    }
  );
}

export class DefaultRequestHandler implements IRequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void {
    queue.push({
      'url': url,
      'callback': cb
    });
    processQueue();
  }
}
