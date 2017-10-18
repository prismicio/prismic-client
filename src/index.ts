import Predicates from './Predicates';
import DefaultClient from './Client';
import Api, { ApiOptions } from './Api';
import { EXPERIMENT_COOKIE, PREVIEW_COOKIE } from './ResolvedApi';

module.exports = {
  Predicates,
  Api,
  client(url: string, options?: ApiOptions) {
    return new DefaultClient(url, options);
  },
  getApi: DefaultClient.getApi,
  api: DefaultClient.getApi,
  experimentCookie: EXPERIMENT_COOKIE,
  previewCookie: PREVIEW_COOKIE,
};
