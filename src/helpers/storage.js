export const storage = {
  get(key) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      const payload =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, payload);
    } catch {
      // ignore quota errors
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch {
      // noop
    }
  },
};
