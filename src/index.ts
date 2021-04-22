import ResolvedApi, { EXPERIMENT_COOKIE as experimentCookie, PREVIEW_COOKIE as previewCookie } from './ResolvedApi';
import Predicates from './Predicates';
import { Experiments } from './experiments';
import Api, { ApiOptions } from './Api';
import { DefaultClient } from './client';

export default {
  experimentCookie,
  previewCookie,
  Predicates,
  predicates: Predicates,
  Experiments,
  Api,
  client,
  getApi,
  api,
  getTags,
  tags,
};

function client(url: string, options?: ApiOptions): DefaultClient {
  return new DefaultClient(url, options);
}

function getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
  return DefaultClient.getApi(url, options);
}

function api(url: string, options?: ApiOptions): Promise<ResolvedApi> {
  return getApi(url, options);
}

function getTags(url: string, options?: ApiOptions): Promise<Array<string>> {
  return DefaultClient.getTags(url, options);
}

function tags(url: string, options?: ApiOptions): Promise<Array<string>> {
  return getTags(url, options);
}