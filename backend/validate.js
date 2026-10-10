// ============================================================
//  validate.js — Server-side input validation & sanitisation
//  All inputs from untrusted clients MUST pass through here.
// ============================================================

// ── Constants ─────────────────────────────────────────────────

const MAX_NAME_LEN     = 20;
const MIN_NAME_LEN     = 1;
const ROOM_CODE_RE     = /^[A-Z0-9]{4,8}$/;
const ROOM_ID_RE       = /^[a-z0-9]{6,12}$/;
const VALID_COUNTS     = new Set([2, 3, 4, 6, 8, 9, 10, 12]);
const VALID_TEAMS      = new Set([2, 3]);
const VALID_CARD_IDS   = new Set([...Array(108).keys()].map(i => i + 1)); // 1-108
const VALID_BOARD_IDS  = new Set([...Array(100).keys()].map(i => i + 1)); // 1-100
const VALID_DIFF       = new Set(['random', 'smart']);
const VALID_PLAYER_KEYS = new Set(['player1','player2','player3','player4','player5','player6','player7','player8','player9','player10','player11','player12']);

// ── Sanitise free-text (strip HTML entities, control chars) ──

/**
 * Strip any characters outside printable ASCII (32-126) and
 * collapse multiple spaces. Never use this as raw HTML.
 */
function sanitiseName(raw) {
    if (typeof raw !== 'string') return null;
    // Remove control characters and null bytes
    const stripped = raw
        .replace(/[\x00-\x1F\x7F]/g, '')  // strip control chars
        .replace(/[<>&"'`]/g, '')           // strip HTML special chars
        .replace(/\s+/g, ' ')              // collapse whitespace
        .trim();
    if (stripped.length < MIN_NAME_LEN || stripped.length > MAX_NAME_LEN) return null;
    return stripped;
}

/**
 * Validate and normalise a room code string.
 */
function sanitiseRoomCode(raw) {
    if (typeof raw !== 'string') return null;
    const up = raw.toUpperCase().trim();
    return ROOM_CODE_RE.test(up) ? up : null;
}

/**
 * Validate a room ID (internal alphanumeric handle).
 */
function sanitiseRoomId(raw) {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    return ROOM_ID_RE.test(trimmed) ? trimmed : null;
}

/**
 * Validate player count.
 */
function sanitisePlayerCount(raw) {
    const n = Number(raw);
    return VALID_COUNTS.has(n) ? n : null;
}

/**
 * Validate numTeams.
 */
function sanitiseNumTeams(raw) {
    if (raw == null) return null; // caller may omit — let server derive
    const n = Number(raw);
    return VALID_TEAMS.has(n) ? n : null;
}

/**
 * Validate a card ID (hand card or board position).
 */
function sanitiseCardId(raw) {
    const n = Number(raw);
    return Number.isInteger(n) && VALID_CARD_IDS.has(n) ? n : null;
}

/**
 * Validate a board position ID (1-100).
 */
function sanitiseBoardId(raw) {
    const n = Number(raw);
    return Number.isInteger(n) && VALID_BOARD_IDS.has(n) ? n : null;
}

/**
 * Validate CPU difficulty string.
 */
function sanitiseDifficulty(raw) {
    if (typeof raw !== 'string') return 'random';
    return VALID_DIFF.has(raw) ? raw : 'random';
}

/**
 * Validate a sessionId token (alphanumeric only).
 */
function sanitiseSessionId(raw) {
    if (typeof raw !== 'string') return null;
    return /^[a-z0-9]{8,64}$/.test(raw) ? raw : null;
}

// ── Rate limiter ───────────────────────────────────────────────

/**
 * Simple per-socket event rate limiter.
 * Tracks event counts per (socketId, eventName) per window.
 */
class RateLimiter {
    constructor() {
        /** @type {Map<string, {count: number, resetAt: number}>} */
        this._buckets = new Map();
    }

    /**
     * Check whether the socket is within rate limits for eventName.
     * @param {string} socketId
     * @param {string} eventName
     * @param {number} maxPerWindow   Max allowed calls
     * @param {number} windowMs       Window length in ms (default 5 s)
     * @returns {boolean} true = allowed, false = rate-limited
     */
    allow(socketId, eventName, maxPerWindow = 10, windowMs = 5000) {
        const key = `${socketId}:${eventName}`;
        const now = Date.now();
        let bucket = this._buckets.get(key);

        if (!bucket || now >= bucket.resetAt) {
            bucket = { count: 0, resetAt: now + windowMs };
            this._buckets.set(key, bucket);
        }

        bucket.count++;
        return bucket.count <= maxPerWindow;
    }

    /** Periodically prune expired buckets to prevent memory growth. */
    prune() {
        const now = Date.now();
        for (const [key, bucket] of this._buckets) {
            if (now >= bucket.resetAt) this._buckets.delete(key);
        }
    }
}

const rateLimiter = new RateLimiter();
// Prune stale buckets every 60 seconds
setInterval(() => rateLimiter.prune(), 60_000);

module.exports = {
    sanitiseName,
    sanitiseRoomCode,
    sanitiseRoomId,
    sanitisePlayerCount,
    sanitiseNumTeams,
    sanitiseCardId,
    sanitiseBoardId,
    sanitiseDifficulty,
    sanitiseSessionId,
    rateLimiter,
    MAX_NAME_LEN,
    VALID_PLAYER_KEYS,
};
