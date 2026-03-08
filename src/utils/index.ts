import { Platform } from 'react-native';
import queryString from 'query-string';
import { APP_SCHEME_SLUG } from '../constants';

/**
 * The function getAppDeepLink returns a deep link based on the platform being used.
 * @returns The function `getAppDeepLink` returns a deep link based on the platform. If the platform is
 * Android, it returns `://my-host/`, otherwise, it returns `://`.
 */
export const getAppDeepLink = (scheme: string = APP_SCHEME_SLUG) => {
  return Platform.OS === 'android' ? `${scheme}://my-host/` : `${scheme}://`;
};

/**
 * The function `parseQueryString` takes a URL string and returns an object representing the key-value
 * pairs of the query parameters.
 * @param {string} url - The `url` parameter in the `parseQueryString` function is a string that
 * represents a URL containing query parameters.
 */
export const parseQueryString = (url: string): Record<string, string> =>
  queryString.parse(url) as Record<string, string>;
