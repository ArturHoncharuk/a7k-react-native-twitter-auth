# a7k-react-native-twitter-auth

A lightweight React Native library for authenticating users with X (formerly Twitter) using OAuth 1.0a. Works with both **Expo** and **bare React Native** projects.

## Installation

```sh
# npm
npm install a7k-react-native-twitter-auth

# yarn
yarn add a7k-react-native-twitter-auth
```

> `react-native-inappbrowser-reborn` is bundled as a dependency and installs automatically — no need to install it separately.

### iOS — install pods

After installing the library, run pod install to link the native in-app browser module:

```sh
cd ios && pod install
```

## Prerequisites

### 1. Register your app's deep link scheme

**Expo** — add `scheme` to `app.json`:

```json
{
  "expo": {
    "scheme": "your-app-scheme"
  }
}
```

**Bare React Native** — add the scheme to `ios/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>your-app-scheme</string>
    </array>
  </dict>
</array>
```

And to `android/app/src/main/AndroidManifest.xml` inside your main `<activity>`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="your-app-scheme" android:host="my-host" />
</intent-filter>
```

### 2. Configure the Twitter / X Developer Portal

Go to [developer.twitter.com](https://developer.twitter.com) → your app → **User authentication settings**:

- Enable **OAuth 1.0a**
- Set app permissions to at least **Read**
- Add callback URLs:
  - iOS: `your-app-scheme://`
  - Android: `your-app-scheme://my-host/`

> After saving, regenerate your consumer key and secret — Twitter invalidates them when auth settings change.

### 3. Use a native build

`react-native-inappbrowser-reborn` requires native code — it does **not** work with Expo Go.

```sh
# Expo
npx expo run:ios
npx expo run:android

# Bare React Native
npx react-native run-ios
npx react-native run-android
```

## Usage

### Expo

```tsx
import { TwitterAuthProvider } from 'a7k-react-native-twitter-auth';
import type { TwitterAuthResult } from 'a7k-react-native-twitter-auth';

const twitterAuth = new TwitterAuthProvider({
  clientId: 'YOUR_CONSUMER_KEY',
  clientSecret: 'YOUR_CONSUMER_SECRET',
  appScheme: 'your-app-scheme', // matches app.json "scheme" and Twitter callback URLs
});

export default function App() {
  const [result, setResult] = useState<TwitterAuthResult | null>(null);

  const signIn = async () => {
    const data = await twitterAuth.login();
    setResult(data);
    // data.oauthToken        — use for authenticated API calls
    // data.oauthTokenSecret  — store securely
  };

  return <Button title="Sign in with X" onPress={signIn} />;
}
```

### Bare React Native

```tsx
import { TwitterAuthProvider } from 'a7k-react-native-twitter-auth';
import type { TwitterAuthResult } from 'a7k-react-native-twitter-auth';

const twitterAuth = new TwitterAuthProvider({
  clientId: 'YOUR_CONSUMER_KEY',
  clientSecret: 'YOUR_CONSUMER_SECRET',
  appScheme: 'your-app-scheme', // matches Info.plist / AndroidManifest scheme
});

export default function App() {
  const [result, setResult] = useState<TwitterAuthResult | null>(null);

  const signIn = async () => {
    const data = await twitterAuth.login();
    setResult(data);
  };

  return <Button title="Sign in with X" onPress={signIn} />;
}
```

## API

### `new TwitterAuthProvider(options)`

| Option | Type | Description |
|--------|------|-------------|
| `clientId` | `string` | Twitter app consumer key |
| `clientSecret` | `string` | Twitter app consumer secret |
| `appScheme` | `string` | Your app's deep link scheme (e.g. `myapp`) |

### `twitterAuth.login()`

Opens the Twitter auth flow in an in-app browser and returns a `Promise<TwitterAuthResult>`.

### `TwitterAuthResult`

| Field | Type | Description |
|-------|------|-------------|
| `oauthToken` | `string \| undefined` | Access token for API calls |
| `oauthTokenSecret` | `string \| undefined` | Access token secret |
| `oauthVerifier` | `string \| undefined` | OAuth verifier |

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
