import { Platform } from 'react-native';
import { TwitterAuthProvider, type TwitterAuthResult } from '../index';
import { TwitterSdk } from '../core';
import { getAppDeepLink } from '../utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-inappbrowser-reborn', () => ({
  InAppBrowser: {
    isAvailable: jest.fn().mockResolvedValue(true),
    openAuth: jest.fn(),
  },
}));

jest.mock('../core', () => ({
  TwitterSdk: jest.fn(),
}));

const { InAppBrowser } = require('react-native-inappbrowser-reborn');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APP_SCHEME = 'myapp';

type MockSdk = {
  getTwitterRequestToken: jest.Mock;
  getAccessToken: jest.Mock;
};

// ─── getAppDeepLink ───────────────────────────────────────────────────────────

describe('getAppDeepLink', () => {
  it('returns ios scheme when platform is ios', () => {
    Platform.OS = 'ios';
    expect(getAppDeepLink('myapp')).toBe('myapp://');
  });

  it('returns android scheme with host when platform is android', () => {
    Platform.OS = 'android';
    expect(getAppDeepLink('myapp')).toBe('myapp://callback/');
  });

  it('falls back to default scheme when no argument is provided', () => {
    Platform.OS = 'ios';
    expect(getAppDeepLink('foobar')).toMatch(/:\/\//);
  });
});

// ─── TwitterAuthProvider ──────────────────────────────────────────────────────

describe('TwitterAuthProvider', () => {
  let mockSdk: MockSdk;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    InAppBrowser.isAvailable.mockResolvedValue(true);

    mockSdk = {
      getTwitterRequestToken: jest.fn(),
      getAccessToken: jest.fn(),
    };
    (TwitterSdk as jest.Mock).mockImplementation(() => mockSdk);
  });

  function makeProvider() {
    return new TwitterAuthProvider({
      clientId: 'test-key',
      clientSecret: 'test-secret',
      appScheme: APP_SCHEME,
    });
  }

  it('constructs without throwing', () => {
    expect(() => makeProvider()).not.toThrow();
  });

  describe('login()', () => {
    it('returns oauthToken, oauthTokenSecret, oauthVerifier on success', async () => {
      mockSdk.getTwitterRequestToken.mockResolvedValue({
        oauth_token: 'req-token',
        oauth_token_secret: 'req-secret',
      });
      InAppBrowser.openAuth.mockResolvedValue({
        type: 'success',
        url: `${APP_SCHEME}://?oauth_token=req-token&oauth_verifier=verifier123`,
      });
      mockSdk.getAccessToken.mockResolvedValue({
        oauth_token: 'access-token',
        oauth_token_secret: 'access-secret',
        oauth_verifier: 'verifier123',
      });

      const result: TwitterAuthResult = await makeProvider().login();

      expect(result.oauthToken).toBe('access-token');
      expect(result.oauthTokenSecret).toBe('access-secret');
      expect(result.oauthVerifier).toBe('verifier123');
    });

    it('passes appScheme to getTwitterRequestToken', async () => {
      mockSdk.getTwitterRequestToken.mockResolvedValue({
        oauth_token: 'req-token',
        oauth_token_secret: 'req-secret',
      });
      InAppBrowser.openAuth.mockResolvedValue({
        type: 'success',
        url: `${APP_SCHEME}://?oauth_token=req-token&oauth_verifier=v`,
      });
      mockSdk.getAccessToken.mockResolvedValue({
        oauth_token: 'tok',
        oauth_token_secret: 'sec',
        oauth_verifier: 'v',
      });

      await makeProvider().login();

      expect(mockSdk.getTwitterRequestToken).toHaveBeenCalledWith(APP_SCHEME);
    });

    it('passes correct callbackUrl to InAppBrowser.openAuth', async () => {
      mockSdk.getTwitterRequestToken.mockResolvedValue({
        oauth_token: 'req-token',
        oauth_token_secret: 'req-secret',
      });
      InAppBrowser.openAuth.mockResolvedValue({
        type: 'success',
        url: `${APP_SCHEME}://?oauth_token=req-token&oauth_verifier=v`,
      });
      mockSdk.getAccessToken.mockResolvedValue({
        oauth_token: 'tok',
        oauth_token_secret: 'sec',
        oauth_verifier: 'v',
      });

      await makeProvider().login();

      expect(InAppBrowser.openAuth).toHaveBeenCalledWith(
        expect.stringContaining('oauth_token=req-token'),
        `${APP_SCHEME}://`,
        expect.any(Object)
      );
    });

    it('throws when InAppBrowser is not available', async () => {
      InAppBrowser.isAvailable.mockResolvedValue(false);
      mockSdk.getTwitterRequestToken.mockResolvedValue({
        oauth_token: 'req-token',
        oauth_token_secret: 'req-secret',
      });

      await expect(makeProvider().login()).rejects.toThrow(
        'InAppBrowser is not available'
      );
    });

    it('throws when user cancels the browser', async () => {
      mockSdk.getTwitterRequestToken.mockResolvedValue({
        oauth_token: 'req-token',
        oauth_token_secret: 'req-secret',
      });
      InAppBrowser.openAuth.mockResolvedValue({ type: 'cancel' });

      await expect(makeProvider().login()).rejects.toThrow(
        'Twitter login cancelled or error'
      );
    });

    it('throws when getTwitterRequestToken fails', async () => {
      mockSdk.getTwitterRequestToken.mockRejectedValue(
        new Error('HTTP 403: Callback URL not approved')
      );

      await expect(makeProvider().login()).rejects.toThrow('HTTP 403');
    });

    it('throws when getAccessToken fails', async () => {
      mockSdk.getTwitterRequestToken.mockResolvedValue({
        oauth_token: 'req-token',
        oauth_token_secret: 'req-secret',
      });
      InAppBrowser.openAuth.mockResolvedValue({
        type: 'success',
        url: `${APP_SCHEME}://?oauth_token=req-token&oauth_verifier=v`,
      });
      mockSdk.getAccessToken.mockRejectedValue(
        new Error('HTTP 401: Unauthorized')
      );

      await expect(makeProvider().login()).rejects.toThrow('HTTP 401');
    });
  });
});
