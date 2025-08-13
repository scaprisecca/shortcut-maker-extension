/**
 * @fileoverview Selector utility functions for the Shortcut Maker extension.
 */

/**
 * Validates if a given string is a syntactically correct CSS selector.
 * @param {string} selector The CSS selector string to validate.
 * @returns {boolean} True if the selector is valid, false otherwise.
 */
export function isValidSelector(selector) {
  if (!selector) {
    return false;
  }
  try {
    // The best way to check for a valid selector is to simply try to use it.
    // This will throw an error if the syntax is incorrect.
    document.querySelector(selector);
    return true;
  } catch (e) {
    // If an error is caught, it's not a valid selector.
    return false;
  }
}
