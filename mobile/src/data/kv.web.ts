/** Web twin of kv.ts for the browser UI preview (not a product target): localStorage, same shape. */
export const kv = {
  get: (key: string): string | null => localStorage.getItem(key),
  set: (key: string, value: string): void => localStorage.setItem(key, value),
};
