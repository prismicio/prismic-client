import ResolvedApi, { EXPERIMENT_COOKIE as experimentCookie, PREVIEW_COOKIE as previewCookie } from './ResolvedApi';
import Predicates from './Predicates';
import { Experiments } from './experiments';
import Api, { ApiOptions } from './Api';
import { DefaultClient } from './client';

export default {
  experimentCookie,
  previewCookie,
  Predicates,
  Experiments,
  Api,
  // ! Backward compatibility support !
  // client, getApi, api must be exported in the default object AND using named
  // exports
  client,
  getApi,
  api,
};

export function client(url: string, options?: ApiOptions): DefaultClient {
  return new DefaultClient(url, options);
}

export function getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
  return DefaultClient.getApi(url, options);
}

export function api(url: string, options?: ApiOptions): Promise<ResolvedApi> {
  return getApi(url, options);
}
