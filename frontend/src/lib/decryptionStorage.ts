/**
 * Utility functions for persisting decrypted expense entries in localStorage
 * This ensures decrypted data persists across page refreshes
 */

interface ExpenseEntry {
  date: number;
  category: number;
  level: number;
  emotion: number;
  timestamp: number;
}

/**
 * Get the storage key for decrypted entries based on user address and contract address
 */
function getStorageKey(userAddress: string, contractAddress: string): string {
  return `decrypted_entries_${userAddress.toLowerCase()}_${contractAddress.toLowerCase()}`;
}

/**
 * Save decrypted entries to localStorage
 */
export function saveDecryptedEntries(
  userAddress: string,
  contractAddress: string,
  entries: Map<number, ExpenseEntry>
): void {
  try {
    const key = getStorageKey(userAddress, contractAddress);
    const entriesArray = Array.from(entries.entries()).map(([date, entry]) => ({
      date,
      ...entry,
    }));
    localStorage.setItem(key, JSON.stringify(entriesArray));
    console.log(`[decryptionStorage] Saved ${entriesArray.length} decrypted entries to localStorage`);
  } catch (error) {
    console.error("[decryptionStorage] Error saving decrypted entries:", error);
  }
}

/**
 * Load decrypted entries from localStorage
 */
export function loadDecryptedEntries(
  userAddress: string,
  contractAddress: string
): Map<number, ExpenseEntry> {
  try {
    const key = getStorageKey(userAddress, contractAddress);
    const stored = localStorage.getItem(key);
    if (!stored) {
      return new Map();
    }

    const entriesArray = JSON.parse(stored) as Array<{ date: number } & ExpenseEntry>;
    const entriesMap = new Map<number, ExpenseEntry>();
    
    entriesArray.forEach((item) => {
      const { date, ...entry } = item;
      // Ensure the entry object has the date property
      entriesMap.set(date, { ...entry, date });
    });

    console.log(`[decryptionStorage] Loaded ${entriesMap.size} decrypted entries from localStorage`);
    return entriesMap;
  } catch (error) {
    console.error("[decryptionStorage] Error loading decrypted entries:", error);
    return new Map();
  }
}

/**
 * Remove a specific decrypted entry from localStorage
 */
export function removeDecryptedEntry(
  userAddress: string,
  contractAddress: string,
  date: number
): void {
  try {
    const key = getStorageKey(userAddress, contractAddress);
    const stored = localStorage.getItem(key);
    if (!stored) return;

    const entriesArray = JSON.parse(stored) as Array<{ date: number } & ExpenseEntry>;
    const filtered = entriesArray.filter((entry) => entry.date !== date);
    localStorage.setItem(key, JSON.stringify(filtered));
    console.log(`[decryptionStorage] Removed decrypted entry for date ${date}`);
  } catch (error) {
    console.error("[decryptionStorage] Error removing decrypted entry:", error);
  }
}

/**
 * Clear all decrypted entries for a user/contract combination
 */
export function clearDecryptedEntries(
  userAddress: string,
  contractAddress: string
): void {
  try {
    const key = getStorageKey(userAddress, contractAddress);
    localStorage.removeItem(key);
    console.log(`[decryptionStorage] Cleared all decrypted entries`);
  } catch (error) {
    console.error("[decryptionStorage] Error clearing decrypted entries:", error);
  }
}

