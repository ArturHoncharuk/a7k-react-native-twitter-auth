import { pipe } from 'ramda';
import queryString from 'query-string';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import type {
  BrowserResult,
  RedirectResult,
} from 'react-native-inappbrowser-reborn';
import { TwitterSdk } from './lib';
import { TWITTER_API_URLS } from './constants';
import { getAppDeepLink } from './utils';

type TwitterAuthProviderProps = {
  clientId: string;
  clientSecret: string;
  appScheme: string;
};

export type TwitterAuthResult = {
  oauthToken: string | undefined;
  oauthTokenSecret: string | undefined;
  oauthVerifier: string | undefined;
};

export class TwitterAuthProvider {
  private twitterAuthApi: TwitterSdk;
  private appScheme: string;

  constructor({ clientId, clientSecret, appScheme }: TwitterAuthProviderProps) {
    this.twitterAuthApi = new TwitterSdk(clientId, clientSecret);
    this.appScheme = appScheme;
  }

  async login(): Promise<TwitterAuthResult> {
    try {
      const { oauth_token, oauth_token_secret } =
        await this.twitterAuthApi.getTwitterRequestToken(this.appScheme);

      const twitterLoginUrl = `${TWITTER_API_URLS.xAuthenticateUrl}?oauth_token=${oauth_token}`;
      const callbackUrl = getAppDeepLink(this.appScheme);

      if (!InAppBrowser || !(await InAppBrowser.isAvailable())) {
        throw new Error(
          'InAppBrowser is not available. Rebuild the app with native modules (npx expo run:ios / run:android).'
        );
      }

      const { type, url } = (await InAppBrowser.openAuth(
        twitterLoginUrl,
        callbackUrl,
        {
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
        }
      )) as (RedirectResult | BrowserResult) & { url: string };

      if (type === 'success' && url) {
        const extractQueryString = (qs: string): string =>
          qs.includes('?') ? (qs.split('?')[1] as string) : '';

        const parseQuery = (qs: string) =>
          queryString.parse(qs) as Record<string, string>;

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { oauth_token, oauth_verifier } = pipe(
          extractQueryString,
          parseQuery
        )(url) as { oauth_token: string; oauth_verifier: string };

        const accessData = await this.twitterAuthApi.getAccessToken(
          oauth_token,
          oauth_token_secret ?? '',
          oauth_verifier
        );

        return {
          oauthToken: accessData.oauth_token ?? undefined,
          oauthTokenSecret: accessData.oauth_token_secret ?? undefined,
          oauthVerifier: accessData.oauth_verifier ?? undefined,
        };
      } else {
        throw new Error('Twitter login cancelled or error');
      }
    } catch (error) {
      throw error;
    }
  }
}
