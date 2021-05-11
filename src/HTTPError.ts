export class HTTPError extends Error {
  url: string
  options: RequestInit
  response: Response

  constructor(
    reason: string | undefined,
    response: Response,
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
