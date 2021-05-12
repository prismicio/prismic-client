import { ResponseLike } from './types'

/**
 * An error representing a failed HTTP request.
 */
export class HTTPError extends Error {
  /**
   * The URL used to make the network request.
   */
  url: string

  /**
   * Options used to make the network request.
   */
  options: RequestInit

  /**
   * The Response object returned by the network request.
   */
  response: ResponseLike

  /**
   * @param reason A message containing the reason for the failed HTTP request.
   * @param response The Response object returned by the network request.
   * @param url The URL used to make the network request.
   * @param options Options used to make the network request.
   */
  constructor(
    reason: string | undefined,
    response: ResponseLike,
    url: string,
    options: RequestInit,
  ) {
    super(
      reason || `Network request failed with status code ${response.status}`,
    )

    this.url = url
    this.options = options
    this.response = response
  }
}
