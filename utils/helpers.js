/**
 * @fileoverview This file contains helper functions used throughout the extension.
 */

/**
 * Normalizes a keyboard shortcut string into a consistent format.
 * Example: 'Ctrl + Shift + a' -> 'ctrl+shift+a'
 * @param {string} keyString The raw key combination string.
 * @returns {string} The normalized key string.
 */
export function normalizeKeyString(keyString) {
  return keyString
    .toLowerCase()
    .split('+')
    .map(k => k.trim())
    .sort()
    .join('+');
}
