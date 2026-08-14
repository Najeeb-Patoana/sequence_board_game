// ============================================================
//  sanitise.js — Frontend input sanitisation helpers
//  Used before sending ANY user-generated string to the server.
//  React JSX is XSS-safe by default, but we strip dangerous
//  characters at the input boundary so the server never
//  receives crafted payloads.
// ============================================================

export const MAX_NAME_LEN    = 20;
export const ROOM_CODE_RE    = /^[A-Z0-9]{4,8}$/;
export const VALID_ROOM_CODE_CHARS = /[^A-Z0-9]/g;

/**
 * Sanitise a player name:
 * - Strip HTML special characters and control codes
 * - Collapse whitespace
 * - Enforce min/max length
 * @returns {string} Clean name (may be empty — caller should check)
 */
export function sanitiseName(raw) {
    if (typeof raw !== 'string') return '';
    return raw
        .replace(/[\x00-\x1F\x7F]/g, '')   // control chars
        .replace(/[<>&"'`]/g, '')            // HTML special chars
        .replace(/\s+/g, ' ')               // collapse whitespace
        .trim()
        .slice(0, MAX_NAME_LEN);
}

/**
 * Sanitise a room code input: uppercase, strip non-alphanumeric.
 */
export function sanitiseRoomCode(raw) {
    if (typeof raw !== 'string') return '';
    return raw
        .toUpperCase()
        .replace(VALID_ROOM_CODE_CHARS, '')
        .slice(0, 8);
}

/**
 * Validate that a room code looks correct before sending to server.
 */
export function isValidRoomCode(raw) {
    return ROOM_CODE_RE.test(raw);
}

/**
 * Clamp a number to a whitelist of allowed values, returning
 * defaultValue if not found.
 */
export function clampToSet(value, allowedSet, defaultValue) {
    const n = Number(value);
    return allowedSet.has(n) ? n : defaultValue;
}

export const VALID_PLAYER_COUNTS = new Set([2, 3, 4, 6, 8, 9, 10, 12]);
