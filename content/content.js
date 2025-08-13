// Content script for the Shortcut Maker extension

import { getShortcutsForDomain } from '../storage/storage.js';

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
      // Normalize the key combo for consistent matching
      const normalizedKeyCombo = normalizeKeyCombo(shortcut.keyCombo);
      activeShortcuts.set(normalizedKeyCombo, shortcut);
    });
    console.log(`Shortcut Maker: Loaded ${activeShortcuts.size} shortcuts for ${domain}`);
  } catch (error) {
    console.error('Shortcut Maker: Error loading shortcuts', error);
  }
}

/**
 * Converts a KeyboardEvent into a normalized string representation.
 * e.g., 'Ctrl+Shift+K'
 * @param {KeyboardEvent} e The keyboard event.
 * @returns {string} A normalized string for the key combo.
 */
function keyEventToString(e) {
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Meta');

  // Add the main key, ensuring it's not a modifier itself
  const key = e.key.toLowerCase();
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
      parts.push(e.key.toUpperCase());
  }

  return parts.join('+');
}

/**
 * Normalizes a key combo string from storage to match the event string format.
 * @param {string} keyCombo The key combo string (e.g., 'ctrl+/').
 * @returns {string} The normalized key combo string (e.g., 'Ctrl+/').
 */
function normalizeKeyCombo(keyCombo) {
    return keyCombo.split('+').map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1).toLowerCase()).join('+');
}

/**
 * Handles the keydown event to check for and execute shortcuts.
 * @param {KeyboardEvent} e 
 */
function handleKeyDown(e) {
  // Don't trigger shortcuts if the user is typing in an input field, unless it's a textarea
  const targetTagName = e.target.tagName.toLowerCase();
  if ((targetTagName === 'input' && e.target.type !== 'checkbox' && e.target.type !== 'radio') || targetTagName === 'textarea' || e.target.isContentEditable) {
      // Allow shortcuts in textareas, but be mindful of conflicts
      if(targetTagName === 'textarea' && e.key !== 'Escape') {
          // A specific check could be added here if needed
      }
      else if (targetTagName !== 'textarea'){
          return;
      }
  }

  const keyString = keyEventToString(e);
  const normalizedKeyString = normalizeKeyCombo(keyString);
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
