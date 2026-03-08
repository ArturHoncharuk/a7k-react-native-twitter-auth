# a7k-react-native-twitter-auth

React Native OAuth 1.0a authentication for X (Twitter). Works with Expo (managed/bare) and bare React Native.

## Requirements

- React Native ≥ 0.70
- [`react-native-inappbrowser-reborn`](https://github.com/proyecto26/react-native-inappbrowser) ≥ 3.7.0 (peer dependency — install separately)
- A **native build** — Expo Go is not supported

## Installation

```sh
# npm
npm install a7k-react-native-twitter-auth react-native-inappbrowser-reborn

# yarn
yarn add a7k-react-native-twitter-auth react-native-inappbrowser-reborn
```

**iOS** — link native modules:

```sh
cd ios && pod install
```

## Setup

### 1. Deep link scheme

**Expo** (`app.json`):

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

**Bare React Native** — `ios/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

`android/app/src/main/AndroidManifest.xml` (inside your main `<activity>`):

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" android:host="callback" />
</intent-filter>
```

### 2. X Developer Portal

[developer.twitter.com](https://developer.twitter.com) → your app → **User authentication settings**:

- Enable **OAuth 1.0a**
- App permissions: **Read** (minimum)
- Callback URLs:
  - `myapp://` (iOS)
  - `myapp://callback/` (Android)

> Changing auth settings invalidates existing keys — regenerate your consumer key and secret after saving.

## Usage

```tsx
import { TwitterAuthProvider } from 'a7k-react-native-twitter-auth';
import type { TwitterAuthResult } from 'a7k-react-native-twitter-auth';

// Instantiate once, outside the component
const twitterAuth = new TwitterAuthProvider({
  clientId: process.env.TWITTER_CONSUMER_KEY!,
  clientSecret: process.env.TWITTER_CONSUMER_SECRET!,
  appScheme: 'myapp',
});

export default function App() {
  const handleSignIn = async () => {
    try {
      const result: TwitterAuthResult = await twitterAuth.login();
      // result.oauthToken       — access token for API calls
      // result.oauthTokenSecret — store securely (e.g. SecureStore / Keychain)
      // result.oauthVerifier    — returned for completeness; not needed after this step
    } catch (error) {
      // 'Twitter login cancelled or error'  — user dismissed the browser
      // 'InAppBrowser is not available...'  — running in Expo Go or missing native build
      // HTTP errors from Twitter            — bad credentials or misconfigured callback URL
    }
  };

  return <Button title="Sign in with X" onPress={handleSignIn} />;
}
```

## API

### `new TwitterAuthProvider(options)`

| Option | Type | Description |
|---|---|---|
| `clientId` | `string` | Consumer key from the X Developer Portal |
| `clientSecret` | `string` | Consumer secret from the X Developer Portal |
| `appScheme` | `string` | Deep link scheme registered in your app and Twitter callback URLs |

### `twitterAuth.login()`

```ts
login(): Promise<TwitterAuthResult>
```

Opens the X auth flow in an in-app browser. Resolves with tokens on success; throws on cancellation or error.

### `TwitterAuthResult`

| Field | Type | Description |
|---|---|---|
| `oauthToken` | `string \| undefined` | Access token — use in `Authorization` headers for X API v1.1 calls |
| `oauthTokenSecret` | `string \| undefined` | Access token secret — store securely, never log or expose |
| `oauthVerifier` | `string \| undefined` | OAuth verifier — exchanged for the access token internally |

## Running a native build

```sh
# Expo
npx expo run:ios
npx expo run:android

# Bare React Native
npx react-native run-ios
npx react-native run-android
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
