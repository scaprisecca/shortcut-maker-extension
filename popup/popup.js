// JavaScript for the Shortcut Maker popup

import { getShortcutsForDomain, createShortcut, getShortcuts, updateShortcut, deleteShortcut } from '../storage/storage.js';

// DOM Elements
const shortcutList = document.getElementById('shortcut-list');
const noShortcutsMessage = document.getElementById('no-shortcuts-message');
const currentDomainEl = document.getElementById('current-domain');

/**
 * Renders a single shortcut item in the list.
 * @param {import('../storage/storage.js').Shortcut} shortcut
 */
function renderShortcut(shortcut) {
  const li = document.createElement('li');
  li.dataset.shortcutId = shortcut.id;

  li.innerHTML = `
    <div class="shortcut-info">
      <div class="description">${shortcut.description}</div>
      <div class="details">
        <span class="key-combo">${shortcut.keyCombo}</span>
        <span class="selector">| ${shortcut.selector}</span>
      </div>
    </div>
    <div class="actions">
      <button class="edit-btn" title="Edit">✏️</button>
      <button class="delete-btn" title="Delete">🗑️</button>
    </div>
  `;
  shortcutList.appendChild(li);
}

/**
 * Fetches and displays shortcuts for the current domain.
 */
async function displayShortcuts() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url) {
    currentDomainEl.textContent = 'Cannot determine domain.';
    noShortcutsMessage.classList.remove('hidden');
    return;
  }

  const url = new URL(tab.url);
  const domain = url.hostname;

  currentDomainEl.textContent = domain;

  const shortcuts = await getShortcutsForDomain(domain);

  shortcutList.innerHTML = ''; // Clear existing list

  if (shortcuts.length > 0) {
    shortcuts.forEach(renderShortcut);
    noShortcutsMessage.classList.add('hidden');
  } else {
    noShortcutsMessage.classList.remove('hidden');
  }
}

// DOM Elements for form
const addShortcutBtn = document.getElementById('add-shortcut-btn');
const shortcutForm = document.getElementById('shortcut-form');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const shortcutIdInput = document.getElementById('shortcut-id');

/**
 * Shows the form for adding or editing a shortcut.
 */
function showForm() {
  formTitle.textContent = 'Add Shortcut';
  shortcutForm.classList.remove('hidden');
  addShortcutBtn.classList.add('hidden');
}

/**
 * Hides the form and resets it.
 */
function hideForm() {
  shortcutForm.classList.add('hidden');
  addShortcutBtn.classList.remove('hidden');
  shortcutForm.reset();
  shortcutIdInput.value = ''; // Clear the ID when hiding
}

/**
 * Handles the form submission for creating a new shortcut.
 * @param {Event} e
 */
/**
 * Validates the key combination to ensure it's not a duplicate for the current domain.
 * @param {string} keyCombo The key combo to validate.
 * @param {string} currentId The ID of the shortcut being edited, if any.
 * @returns {Promise<boolean>} True if the key combo is valid, false otherwise.
 */
async function isValidKeyCombo(keyCombo, currentId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const domain = new URL(tab.url).hostname;
  const shortcuts = await getShortcutsForDomain(domain);
  
  return !shortcuts.some(shortcut => 
    shortcut.keyCombo.toLowerCase() === keyCombo.toLowerCase() && shortcut.id !== currentId
  );
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const shortcutId = shortcutIdInput.value;
  const keyCombo = document.getElementById('keyCombo').value;

  if (!(await isValidKeyCombo(keyCombo, shortcutId))) {
    alert('This key combination is already in use on this site. Please choose another.');
    return;
  }

  const updates = {
    description: document.getElementById('description').value,
    keyCombo,
    selector: document.getElementById('selector').value,
    action: document.getElementById('action').value,
  };

  if (shortcutId) {
    // Editing an existing shortcut
    await updateShortcut(shortcutId, updates);
  } else {
    // Creating a new shortcut
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const domain = new URL(tab.url).hostname;
    const newShortcutData = { ...updates, domain };
    await createShortcut(newShortcutData);
  }

  hideForm();
  await displayShortcuts(); // Refresh the list
}

// Initial load
document.addEventListener('DOMContentLoaded', displayShortcuts);

/**
 * Handles clicks on the edit button, populating the form with shortcut data.
 * @param {string} shortcutId 
 */
async function handleEditClick(shortcutId) {
  const allShortcuts = await getShortcuts();
  const shortcutToEdit = allShortcuts.find(s => s.id === shortcutId);

  if (shortcutToEdit) {
    formTitle.textContent = 'Edit Shortcut';
    shortcutIdInput.value = shortcutToEdit.id;
    document.getElementById('description').value = shortcutToEdit.description;
    document.getElementById('keyCombo').value = shortcutToEdit.keyCombo;
    document.getElementById('selector').value = shortcutToEdit.selector;
    document.getElementById('action').value = shortcutToEdit.action;
    showForm();
  }
}

// Event Listeners
addShortcutBtn.addEventListener('click', showForm);
cancelBtn.addEventListener('click', hideForm);
shortcutForm.addEventListener('submit', handleFormSubmit);

/**
 * Handles clicks on the delete button, showing a confirmation before deleting.
 * @param {string} shortcutId 
 */
async function handleDeleteClick(shortcutId) {
  if (confirm('Are you sure you want to delete this shortcut?')) {
    await deleteShortcut(shortcutId);
    await displayShortcuts(); // Refresh the list
  }
}

shortcutList.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const shortcutId = e.target.closest('li').dataset.shortcutId;
    handleEditClick(shortcutId);
  }

  if (e.target.classList.contains('delete-btn')) {
    const shortcutId = e.target.closest('li').dataset.shortcutId;
    handleDeleteClick(shortcutId);
  }
});
