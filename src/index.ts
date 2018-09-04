import ResolvedApi, { EXPERIMENT_COOKIE as experimentCookie, PREVIEW_COOKIE as previewCookie } from './ResolvedApi';
import Predicates from './Predicates';
import { Experiments } from './Experiments';
import Api, { ApiOptions } from './Api';
import { DefaultClient } from './client';

export {
  experimentCookie,
  previewCookie,
  Predicates,
  Experiments,
  Api
};

export function client(url: string, options?: ApiOptions) {
  return new DefaultClient(url, options);
}

export function getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
  return DefaultClient.getApi(url, options);
}

export function api(url: string, options?: ApiOptions): Promise<ResolvedApi> {
  return getApi(url, options);
}