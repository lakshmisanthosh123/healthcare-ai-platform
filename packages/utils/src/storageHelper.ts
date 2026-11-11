export const storageSet = (key: string, value: unknown): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    // ignore write errors
    // eslint-disable-next-line no-console
    console.warn("storageSet failed", err);
  }
};

export const storageGet = <T = any>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("storageGet failed", err);
    return null;
  }
};

export const storageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("storageRemove failed", err);
  }
};

export const storageClear = (): void => {
  try {
    localStorage.clear();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("storageClear failed", err);
  }
};
