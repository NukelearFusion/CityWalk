import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * JSON storage on the device (localStorage on the web).
 *
 * Storage can be unavailable — private browsing, a full disk — and nothing
 * stored here is essential, so failures are swallowed and reads fall back to
 * "nothing saved".
 */
export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    if (value === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A plan that is not remembered can simply be generated again.
  }
}
