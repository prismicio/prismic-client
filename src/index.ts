import PrismicPredicates  from './Predicates';
import { Experiments as PrismicExperiment } from './experiments';
import { DefaultClient } from './client';
import PrismicApi, { ApiOptions } from './Api';
import ResolvedApi, { EXPERIMENT_COOKIE, PREVIEW_COOKIE } from './ResolvedApi';

namespace Prismic {

  export const experimentCookie = EXPERIMENT_COOKIE;
  export const previewCookie = PREVIEW_COOKIE;
  export const Predicates = PrismicPredicates;
  export const Experiments = PrismicExperiment;
  export const Api = PrismicApi;

  export function client(url: string, options?: ApiOptions) {
    return new DefaultClient(url, options);
  }

  export function getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
    return DefaultClient.getApi(url, options);
  }

  export function api(url: string, options?: ApiOptions): Promise<ResolvedApi> {
    return getApi(url, options);
  }
}

export = Prismic;
