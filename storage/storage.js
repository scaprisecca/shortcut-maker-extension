/**
 * @typedef {Object} Shortcut
 * @property {string} id - A unique identifier for the shortcut.
 * @property {string} domain - The domain where the shortcut is active.
 * @property {string} keyCombo - The key combination to trigger the shortcut.
 * @property {string} selector - The CSS selector for the target element.
 * @property {'click' | 'focus'} action - The action to perform on the element.
 * @property {string} description - A user-provided description for the shortcut.
 */

/**
 * A utility module for interacting with chrome.storage.local.
 * Provides promise-based wrappers for the callback-based API.
 */

/**
 * Retrieves an item from chrome.storage.local.
 * @param {string | string[] | Object} keys - A key or keys to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the retrieved items.
 */
export function getStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (items) => {
      resolve(items);
    });
  });
}

/**
 * Sets an item in chrome.storage.local.
 * @param {Object} items - An object containing one or more key/value pairs to store.
 * @returns {Promise<void>} A promise that resolves when the items have been set.
 */
export function setStorage(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
}

/**
 * Removes one or more items from chrome.storage.local.
 * @param {string | string[]} keys - A key or keys to remove.
 * @returns {Promise<void>} A promise that resolves when the items have been removed.
 */
export function removeStorage(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => {
      resolve();
    });
  });
}

/**
 * Retrieves all shortcuts from storage.
 * @returns {Promise<Shortcut[]>} A promise that resolves with the array of shortcuts.
 */
export async function getShortcuts() {
  const { shortcuts = [] } = await getStorage('shortcuts');
  return shortcuts;
}

/**
 * Creates a new shortcut and adds it to storage.
 * @param {Omit<Shortcut, 'id'>} shortcutData - The data for the new shortcut.
 * @returns {Promise<Shortcut>} A promise that resolves with the newly created shortcut.
 */
export async function createShortcut(shortcutData) {
  const { domain, keyCombo, selector, action, description } = shortcutData;

  if (!domain?.trim() || !keyCombo?.trim() || !selector?.trim()) {
    throw new Error('Domain, Key Combo, and Selector are required.');
  }
  if (!['click', 'focus'].includes(action)) {
    throw new Error('Action must be either \'click\' or \'focus\'.');
  }

  const shortcuts = await getShortcuts();
  const newShortcut = {
    id: crypto.randomUUID(),
    domain: domain.trim(),
    keyCombo: keyCombo.trim(),
    selector: selector.trim(),
    action,
    description: description?.trim() ?? '',
  };

  await setStorage({ shortcuts: [...shortcuts, newShortcut] });
  return newShortcut;
}

/**
 * Updates an existing shortcut.
 * @param {string} shortcutId - The ID of the shortcut to update.
 * @param {Partial<Shortcut>} updates - An object with the properties to update.
 * @returns {Promise<Shortcut | null>} A promise that resolves with the updated shortcut, or null if not found.
 */
export async function updateShortcut(shortcutId, updates) {
  const sanitizedUpdates = { ...updates };

  if (sanitizedUpdates.domain !== undefined) {
    sanitizedUpdates.domain = sanitizedUpdates.domain.trim();
    if (!sanitizedUpdates.domain) throw new Error('Domain cannot be empty.');
  }
  if (sanitizedUpdates.keyCombo !== undefined) {
    sanitizedUpdates.keyCombo = sanitizedUpdates.keyCombo.trim();
    if (!sanitizedUpdates.keyCombo) throw new Error('Key combination cannot be empty.');
  }
  if (sanitizedUpdates.selector !== undefined) {
    sanitizedUpdates.selector = sanitizedUpdates.selector.trim();
    if (!sanitizedUpdates.selector) throw new Error('CSS selector cannot be empty.');
  }
  if (sanitizedUpdates.action !== undefined && !['click', 'focus'].includes(sanitizedUpdates.action)) {
    throw new Error('Action must be either \'click\' or \'focus\'.');
  }
  if (sanitizedUpdates.description !== undefined) {
    sanitizedUpdates.description = sanitizedUpdates.description.trim();
  }

  const shortcuts = await getShortcuts();
  let updatedShortcut = null;
  const updatedShortcuts = shortcuts.map(shortcut => {
    if (shortcut.id === shortcutId) {
      updatedShortcut = { ...shortcut, ...sanitizedUpdates };
      return updatedShortcut;
    }
    return shortcut;
  });

  if (updatedShortcut) {
    await setStorage({ shortcuts: updatedShortcuts });
  }
  
  return updatedShortcut;
}

/**
 * Deletes a shortcut from storage.
 * @param {string} shortcutId - The ID of the shortcut to delete.
 * @returns {Promise<void>} A promise that resolves when the shortcut has been deleted.
 */
export async function deleteShortcut(shortcutId) {
  const shortcuts = await getShortcuts();
  const updatedShortcuts = shortcuts.filter(shortcut => shortcut.id !== shortcutId);
  await setStorage({ shortcuts: updatedShortcuts });
}

/**
 * Retrieves all shortcuts for a specific domain.
 * @param {string} domain - The domain to filter shortcuts by.
 * @returns {Promise<Shortcut[]>} A promise that resolves with the array of matching shortcuts.
 */
export async function getShortcutsForDomain(domain) {
  const allShortcuts = await getShortcuts();
  return allShortcuts.filter(shortcut => shortcut.domain === domain);
}
