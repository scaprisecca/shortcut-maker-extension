// Service worker for the Shortcut Maker extension

import { getShortcuts, createShortcut } from './storage/storage.js';

console.log('Shortcut Maker background script loaded.');

// Create a sample shortcut on first installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const shortcuts = await getShortcuts();
    if (shortcuts.length === 0) {
      await createShortcut({
        domain: 'www.google.com',
        keyCombo: 'Ctrl+/',
        selector: 'textarea[name=\'q\']',
        action: 'focus',
        description: 'Focus Google search bar',
      });
      console.log('Sample shortcut for Google created!');
    }
  }
});
