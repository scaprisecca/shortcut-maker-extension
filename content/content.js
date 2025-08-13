// Content script for the Shortcut Maker extension

import { getShortcutsForDomain } from '../storage/storage.js';
import { normalizeKeyString } from '../utils/helpers.js';

let activeShortcuts = new Map();

/**
 * Loads shortcuts for the current domain and populates the activeShortcuts map.
 */
async function loadShortcuts() {
  try {
    const domain = window.location.hostname;
    const shortcuts = await getShortcutsForDomain(domain);
    activeShortcuts.clear();
    shortcuts.forEach(shortcut => {
      // The keyCombo from storage is already normalized by the popup
      activeShortcuts.set(normalizeKeyString(shortcut.keyCombo), shortcut);
    });
    console.log(`Shortcut Maker: Loaded ${activeShortcuts.size} shortcuts for ${domain}.`);
  } catch (error) {
    console.error('Shortcut Maker: Error loading shortcuts', error);
  }
}

/**
 * Creates a consistent string representation from a keyboard event.
 * @param {KeyboardEvent} e The keyboard event.
 * @returns {string} A normalized string for the key combination.
 */
function getKeyStringFromEvent(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');

  const key = e.key.toLowerCase();
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    parts.push(key);
  }

  // The parts are sorted and joined by the imported normalizeKeyString function
  return normalizeKeyString(parts.join('+'));
}

/**
 * Handles the keydown event to check for and execute shortcuts.
 * @param {KeyboardEvent} e 
 */
function handleKeyDown(e) {
  // Don't trigger shortcuts if the user is typing in an input field, unless it's a textarea or content-editable element.
  const target = e.target;
  const isEditable = target.isContentEditable || 
                     target.tagName.toLowerCase() === 'textarea' || 
                     (target.tagName.toLowerCase() === 'input' && /text|password|email|search|tel|url/.test(target.type));

  if (isEditable) {
    // We might still want some shortcuts to work in editable fields, 
    // but for now, we'll keep it simple and exit.
    return;
  }

  const normalizedKeyString = getKeyStringFromEvent(e);
  const shortcut = activeShortcuts.get(normalizedKeyString);

  if (shortcut) {
    const startTime = performance.now();
    e.preventDefault();
    e.stopPropagation();

    const targetElement = document.querySelector(shortcut.selector);

    if (targetElement) {
      highlightElement(targetElement);
      
      if (shortcut.action === 'click') {
        targetElement.click();
      } else if (shortcut.action === 'focus') {
        targetElement.focus();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Shortcut Maker: Executed '${shortcut.description}' in ${duration.toFixed(2)}ms.`);

    } else {
      console.warn(`Shortcut Maker: No element found for selector "${shortcut.selector}"`);
    }
  }
}

// --- Initialization ---

// Load shortcuts when the script is first injected
loadShortcuts();

// Listen for keyboard events
document.addEventListener('keydown', handleKeyDown, true);

// Listen for changes in storage (e.g., user adds/edits a shortcut in the popup)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.shortcuts) {
    console.log('Shortcut Maker: Shortcuts changed, reloading...');
    loadShortcuts();
  }
});

/**
 * Applies a brief highlight effect to an element.
 * @param {HTMLElement} element The element to highlight.
 */
function highlightElement(element) {
  const highlightClass = 'shortcut-maker-highlight';
  element.classList.add(highlightClass);
  setTimeout(() => {
    element.classList.remove(highlightClass);
  }, 500); // Highlight for 500ms
}

/**
 * Injects the CSS for the highlight effect into the page.
 */
function injectHighlightCss() {
  const styleId = 'shortcut-maker-styles';
  if (document.getElementById(styleId)) {
    return; // Style already injected
  }
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .shortcut-maker-highlight {
      outline: 2px solid #3498db !important;
      box-shadow: 0 0 10px #3498db !important;
      transition: outline 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

injectHighlightCss();
