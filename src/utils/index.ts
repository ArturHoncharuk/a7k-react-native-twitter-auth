import { Platform } from 'react-native';
import queryString from 'query-string';

/**
 * The function getAppDeepLink returns a deep link based on the platform being used.
 * @returns The function `getAppDeepLink` returns a deep link based on the platform. If the platform is
 * Android, it returns `://callback/`, otherwise, it returns `://`.
 */
export const getAppDeepLink = (scheme: string | undefined) => {
  return Platform.OS === 'android' ? `${scheme}://callback/` : `${scheme}://`;
};

/**
 * The function `parseQueryString` takes a URL string and returns an object representing the key-value
 * pairs of the query parameters.
 * @param {string} url - The `url` parameter in the `parseQueryString` function is a string that
 * represents a URL containing query parameters.
 */
export const parseQueryString = (url: string): Record<string, string> =>
  queryString.parse(url) as Record<string, string>;
