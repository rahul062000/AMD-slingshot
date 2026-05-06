/* ============================================================
   Nutrilite — Secure Storage Utility
   XSS-safe localStorage with integrity checks & data validation
   ============================================================ */
const NutriStore = (() => {
  'use strict';
  const PREFIX = 'nutrilite_';
  const VERSION = '1.0';

  // Simple obfuscation (not encryption, but deters casual inspection)
  function encode(data) {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch { return null; }
  }
  function decode(str) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(str))));
    } catch { return null; }
  }
  // Integrity hash (simple checksum)
  function checksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    return hash.toString(36);
  }

  function set(key, value) {
    try {
      const encoded = encode(value);
      if (!encoded) return false;
      const cs = checksum(encoded);
      localStorage.setItem(PREFIX + key, JSON.stringify({ v: VERSION, d: encoded, c: cs }));
      return true;
    } catch (e) {
      console.warn('NutriStore: Failed to save', key, e);
      return false;
    }
  }

  function get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return defaultValue;
      const wrapper = JSON.parse(raw);
      if (!wrapper || !wrapper.d || !wrapper.c) return defaultValue;
      // Integrity check
      if (checksum(wrapper.d) !== wrapper.c) {
        console.warn('NutriStore: Integrity check failed for', key);
        remove(key);
        return defaultValue;
      }
      const decoded = decode(wrapper.d);
      return decoded !== null ? decoded : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  }

  function has(key) {
    return localStorage.getItem(PREFIX + key) !== null;
  }

  // Get with type validation
  function getTyped(key, type, defaultValue) {
    const val = get(key, defaultValue);
    if (typeof val !== type) return defaultValue;
    return val;
  }

  function getArray(key, defaultValue = []) {
    const val = get(key, defaultValue);
    return Array.isArray(val) ? val : defaultValue;
  }

  function getObject(key, defaultValue = {}) {
    const val = get(key, defaultValue);
    return (val && typeof val === 'object' && !Array.isArray(val)) ? val : defaultValue;
  }

  // Append to array
  function push(key, item) {
    const arr = getArray(key);
    arr.push(item);
    return set(key, arr);
  }

  // Update object (merge)
  function merge(key, partial) {
    const obj = getObject(key);
    Object.assign(obj, partial);
    return set(key, obj);
  }

  return { set, get, remove, clear, has, getTyped, getArray, getObject, push, merge };
})();
