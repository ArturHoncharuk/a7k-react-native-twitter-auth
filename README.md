# a7k-react-native-twitter-auth

A lightweight React Native library for authenticating users with X (formerly Twitter) in mobile applications.

## Installation


```sh
npm install a7k-react-native-twitter-auth
```


## Prerequisites

### 1. Register your deep link scheme

In your **app.json** (Expo) or native config, declare your app's URL scheme:

```json
{
  "expo": {
    "scheme": "your-app-scheme"
  }
}
```

### 2. Configure the Twitter Developer Portal

In your app's **User authentication settings**:

- Enable **OAuth 1.0a**
- Set app permissions to at least **Read**
- Add your callback URLs:
  - iOS: `your-app-scheme://`
  - Android: `your-app-scheme://my-host/`

### 3. Build with native modules

This library depends on `react-native-inappbrowser-reborn`, which requires a native build:

```sh
npx expo run:ios
# or
npx expo run:android
```

## Usage

```tsx
import { TwitterAuthProvider } from 'a7k-react-native-twitter-auth';

const twitterAuth = new TwitterAuthProvider({
  clientId: 'YOUR_CONSUMER_KEY',
  clientSecret: 'YOUR_CONSUMER_SECRET',
  appScheme: 'your-app-scheme', // must match app.json scheme and Twitter callback URLs
});

export default function App() {
  const signIn = async () => {
    const result = await twitterAuth.login();
    // result.oauth_token — use this to make authenticated API calls
    // result.oauth_token_secret
    console.log('Signed in:', result);
  };

  return <Button title="Sign in with X" onPress={signIn} />;
}
```


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
