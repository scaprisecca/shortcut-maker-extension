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
 * Checks for shortcuts on a given tab and injects the content script if necessary.
 * Also updates the action badge.
 * @param {number} tabId The ID of the tab to process.
 * @param {string} [tabUrl] The URL of the tab, if available.
 */
async function processTab(tabId, tabUrl) {
  if (!tabUrl || !(tabUrl.startsWith('http:') || tabUrl.startsWith('https://'))) {
    chrome.action.setBadgeText({ text: '', tabId: tabId });
    return; // Ignore non-web pages
  }

  const domain = new URL(tabUrl).hostname;
  const shortcuts = await getShortcutsForDomain(domain);
  const count = shortcuts.length;

  // Update badge
  chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '', tabId: tabId });
  chrome.action.setBadgeBackgroundColor({ color: '#3498db' });

  // Inject content script if shortcuts exist and it hasn't been injected yet
  if (count > 0) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/content.js'],
      });
    } catch (e) {
      // Avoids errors when the script is already injected, which can happen.
      if (!e.message.includes('already been injected')) {
        console.error(`Shortcut Maker: Failed to inject script: ${e.message}`);
      }
    }
  }
}

// Process tab when it's updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    processTab(tabId, tab.url);
  }
});

// Process tab when it becomes active
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    processTab(activeInfo.tabId, tab.url);
  }
});

// Update badge when shortcuts are changed in storage
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.shortcuts) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      // Re-process the tab to update the badge and inject script if needed
      processTab(tab.id, tab.url);
    }
  }
});
