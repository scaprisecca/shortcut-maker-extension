/**
 * @fileoverview This file contains constants used throughout the extension.
 */

// A list of key combinations that are essential for browser operation and should not be overridden.
// Format is based on the normalized key string generated in content.js and popup.js.
export const PROTECTED_SHORTCUTS = [
  // Tab and window management
  'ctrl+t',
  'ctrl+n',
  'ctrl+w',
  'ctrl+shift+t',
  'ctrl+shift+n',
  'ctrl+shift+w',
  'ctrl+tab',
  'ctrl+shift+tab',

  // Page navigation
  'ctrl+l',
  'alt+home',
  'alt+arrowleft',
  'alt+arrowright',
  'f5',
  'ctrl+r',

  // Zooming
  'ctrl+=',
  'ctrl+-',
  'ctrl+0',

  // Browser features
  'ctrl+p',
  'ctrl+s',
  'ctrl+f',
  'ctrl+h',
  'ctrl+j',
  'ctrl+d',
  'ctrl+shift+b',
  'ctrl+shift+delete',

  // DevTools
  'f12',
  'ctrl+shift+i',
  'ctrl+shift+j',
  'ctrl+shift+c',
];
