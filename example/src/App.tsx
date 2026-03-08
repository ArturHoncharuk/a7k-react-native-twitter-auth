import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TwitterAuthProvider } from 'a7k-react-native-twitter-auth';
import type { TwitterAuthResult } from 'a7k-react-native-twitter-auth';

const twitterAuth = new TwitterAuthProvider({
  clientId: 'YOUR_KEY',
  clientSecret: 'YOUR_KEY',
  appScheme: 'foobar',
});

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<TwitterAuthResult | null>(null);

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthResult(null);

      const result = await twitterAuth.login();
      setAuthResult(result);
    } catch (e: any) {
      setError(e?.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => setAuthResult(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Twitter / X Auth Demo</Text>

      {authResult ? (
        <View style={styles.card}>
          <Text style={styles.label}>Signed in</Text>
          <Text style={styles.token} numberOfLines={1}>
            Token: {authResult.oauthToken}
          </Text>
          <Pressable
            style={[styles.button, styles.signOutButton]}
            onPress={signOut}
          >
            <Text style={styles.buttonText}>Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={signIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in with X (Twitter)</Text>
          )}
        </Pressable>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButton: {
    backgroundColor: '#555',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  token: {
    fontSize: 13,
    color: '#333',
    maxWidth: '100%',
  },
  error: {
    marginTop: 20,
    color: '#d00',
    textAlign: 'center',
  },
});
