export const createAuthorizationHeader = (
  accessToken?: string,
  type = "Token"
): string | undefined =>
  accessToken != null ? `${type} ${accessToken}` : undefined;
