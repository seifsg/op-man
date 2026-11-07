import { Storage } from 'expo-sqlite/kv-store';

/** On-device key-value store: SQLite-backed, synchronous, each write atomic. */
export const kv = {
  get: (key: string): string | null => Storage.getItemSync(key),
  set: (key: string, value: string): void => Storage.setItemSync(key, value),
};
