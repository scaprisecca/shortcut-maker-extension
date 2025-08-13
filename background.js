// Service worker for the Shortcut Maker extension

import { getShortcuts, createShortcut, getShortcutsForDomain } from './storage/storage.js';

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
      console.log('Sample shortcut created for www.google.com');
    }
  }
});

/**
 * Updates the action badge with the number of shortcuts for a given tab.
 * @param {number} tabId The ID of the tab to update the badge for.
 */
async function updateActionBadge(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https://'))) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    const shortcuts = await getShortcutsForDomain(domain);
    const count = shortcuts.length > 0 ? shortcuts.length.toString() : '';
    
    chrome.action.setBadgeText({ text: count, tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#3498db' });
  } else {
    // Clear badge for non-web pages (e.g., chrome://extensions)
    chrome.action.setBadgeText({ text: '', tabId: tabId });
  }
}

// Update badge when a tab is updated (e.g., new URL)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    updateActionBadge(tabId);
  }
});

// Update badge when the user switches to a different tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateActionBadge(activeInfo.tabId);
});

// Update badge when shortcuts are changed in storage
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.shortcuts) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      updateActionBadge(tab.id);
    }
  }
});
