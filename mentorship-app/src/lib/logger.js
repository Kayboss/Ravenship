// src/lib/logger.js
// Centralized logger. In production, console output is suppressed so internal
// details (function names, object shapes, Firestore paths) are never exposed
// to users inspecting the browser console. Detailed diagnostics are captured
// server-side via logError() → the admin-read-only Firestore `errors` collection.
const isProd = import.meta.env.PROD;

const noop = () => {};

export const logger = isProd
  ? {
      error: noop,
      warn: noop,
      info: noop,
      log: noop,
      debug: noop,
    }
  : {
      error: (...args) => console.error(...args),
      warn: (...args) => console.warn(...args),
      info: (...args) => console.info(...args),
      log: (...args) => console.log(...args),
      debug: (...args) => console.debug(...args),
    };
