// ============================================================
//  Sequence Game Engine  —  Official Rules Implementation
//  Pure functions, no I/O, no transport concerns.
// ============================================================

const CORNER_IDS = [1, 10, 91, 100];

// Official hand sizes keyed by total player count
const HAND_SIZE_MAP = { 2: 7, 3: 6, 4: 6, 6: 5, 8: 4, 9: 4, 10: 3, 12: 3 };

// Jack card IDs (two decks → two copies each)
// Two-Eyed (Wild)   : J♦ (101,102)  J♠ (105,106)
// One-Eyed (Removal): J♣ (103,104)  J♥ (107,108)
const TWO_EYED_JACK_IDS = new Set([101, 102, 105, 106]);
const ONE_EYED_JACK_IDS = new Set([103, 104, 107, 108]);

// ── Helpers ──────────────────────────────────────────────────

function shuffleDeck(cards) {
    const arr = cards.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getHandSize(numPlayers) {
    return HAND_SIZE_MAP[numPlayers] || 6;
}

function deriveSequencesToWin(numTeams) {
    // 2 teams (or individual 2P) → 2 sequences
    // 3 teams (or individual 3P) → 1 sequence
    return numTeams === 3 ? 1 : 2;
}

/**
 * Determines how many teams to use based on player count.
 * 2P or 3P → individual (numTeams = numPlayers)
 * 4, 8, 10, 12 → 2 teams
 * 6, 9, 12 → can be 3 teams (default: 3 for 6/9/12, 2 for 4/8/10)
 */
function deriveNumTeams(numPlayers) {
    if (numPlayers <= 3) return numPlayers; // individual
    if ([6, 9, 12].includes(numPlayers)) return 3;
    return 2;
}

const TEAM_COLORS = ['blue', 'red', 'green'];

/**
 * Build ordered player-key list with team interleaving.
 * For teams: A1, B1, [C1,] A2, B2, [C2,] ...
 * For individual: player1, player2, [player3]
 */
function buildTurnOrder(numPlayers, numTeams) {
    const keys = [];
    if (numTeams === numPlayers) {
        // Individual play
        for (let i = 0; i < numPlayers; i++) keys.push(`player${i + 1}`);
        return keys;
    }
    // Team play — interleave by team
    const playersPerTeam = numPlayers / numTeams;
    for (let round = 0; round < playersPerTeam; round++) {
        for (let team = 0; team < numTeams; team++) {
            keys.push(`player${team * playersPerTeam + round + 1}`);
        }
    }
    return keys;
}

// ── isInLockedSequence ────────────────────────────────────────

/**
 * Returns true if the board position `boardId` is part of any
 * existing locked (completed) sequence.
 */
function isInLockedSequence(boardId, protectedPatterns) {
    return protectedPatterns.some(pattern => pattern.includes(boardId));
}

// ── isDeadCard ───────────────────────────────────────────────

/**
 * A card is "dead" if ALL of its board position matches are occupied
 * AND the card is not a Jack.
 */
function isDeadCard(handCard, boardCards) {
    if (!handCard.matches || handCard.matches.length === 0) return false;
    if (TWO_EYED_JACK_IDS.has(handCard.id) || ONE_EYED_JACK_IDS.has(handCard.id)) return false;
    return handCard.matches.every(boardId => {
        const bc = boardCards[boardId - 1];
        return bc && (bc.selected === 'True' || CORNER_IDS.includes(boardId));
    });
}

// ── initializeGame ───────────────────────────────────────────

/**
 * @param {Array}  allCards     Full allCards array from allCards.js
 * @param {Object} config
 *   numPlayers   {number}  2|3|4|6|8|9|10|12  (default 2)
 *   numTeams     {number}  auto-derived if omitted
 *   playerNames  {string[]} ordered names (index 0 = player1)
 */
function initializeGame(allCards, config = {}) {
    const numPlayers = config.numPlayers || 2;
    const numTeams = config.numTeams || deriveNumTeams(numPlayers);
    const sequencesToWin = deriveSequencesToWin(numTeams);
    const handSize = getHandSize(numPlayers);
    const playerNames = config.playerNames || [];

    // Deck = all non-corner board cards
    const initialDeck = shuffleDeck(
        allCards.filter(c => !CORNER_IDS.includes(c.id) && c.id <= 108)
    );

    const players = {};
    const scores = {};
    const turnOrder = buildTurnOrder(numPlayers, numTeams);

    // Team assignment: players in the same team-slot share a color
    const playersPerTeam = numTeams === numPlayers ? 1 : numPlayers / numTeams;

    for (let i = 0; i < numPlayers; i++) {
        const key = `player${i + 1}`;
        // Team index: for individual play each player is their own team
        const teamIndex = numTeams === numPlayers
            ? i
            : i % numTeams;
        const color = TEAM_COLORS[teamIndex];

        players[key] = {
            hand: initialDeck.slice(i * handSize, (i + 1) * handSize),
            isTurn: key === turnOrder[0],
            name: playerNames[i] || `Player ${i + 1}`,
            team: color,
            isCpu: false,
        };
        scores[color] = scores[color] || 0;
    }

    const remainingDeck = initialDeck.slice(numPlayers * handSize);

    // Board: snapshot of allCards (ids 1-100 only, corners pre-set as wild)
    const boardCards = JSON.parse(JSON.stringify(allCards.filter(c => c.id <= 100)));

    return {
        config: { numPlayers, numTeams, sequencesToWin, handSize },
        players,
        scores,
        shuffledDeck: remainingDeck,
        cards: boardCards,
        protectedPatterns: [],  // array of arrays of board IDs
        turnOrder,              // ordered player key list
        currentTurnIndex: 0,
    };
}

// ── handleCardSelection ──────────────────────────────────────

/**
 * Process a player action.
 * @param {Object} game          Full game state
 * @param {number} boardId       Target board position id (1-100)
 * @param {string} currentTurn   Player key e.g. 'player1'
 * @param {number} selectedCardId  Card id from hand
 * @param {string} actionType    'PLAY_CARD' | 'DISCARD_DEAD_CARD'
 */
function handleCardSelection(game, boardId, currentTurn, selectedCardId, actionType = 'PLAY_CARD') {
    let newGame = JSON.parse(JSON.stringify(game));
    const currentPlayer = newGame.players[currentTurn];
    if (!currentPlayer) return { success: false, message: 'Invalid player' };

    const playerHand = currentPlayer.hand;
    const cardFromHandIndex = playerHand.findIndex(c => c.id === selectedCardId);
    if (cardFromHandIndex === -1) return { success: false, message: 'Card not in hand' };

    const cardFromHand = playerHand[cardFromHandIndex];
    const teamColor = currentPlayer.team;

    // ── DISCARD_DEAD_CARD ─────────────────────────────────────
    if (actionType === 'DISCARD_DEAD_CARD') {
        if (!isDeadCard(cardFromHand, newGame.cards)) {
            return { success: false, message: 'Card is not dead — both board spaces must be occupied' };
        }
        // Remove from hand, draw replacement
        playerHand.splice(cardFromHandIndex, 1);
        if (newGame.shuffledDeck.length > 0) {
            playerHand.push(newGame.shuffledDeck.shift());
        }
        currentPlayer.hand = playerHand;
        // Advance turn
        const { nextTurn, nextIndex } = advanceTurn(newGame, currentTurn);
        newGame.players[currentTurn].isTurn = false;
        newGame.players[nextTurn].isTurn = true;
        newGame.currentTurnIndex = nextIndex;
        return { success: true, game: newGame, currentPlayer: currentTurn, nextPlayer: nextTurn, wasDeadCard: true };
    }

    // ── PLAY_CARD ─────────────────────────────────────────────
    const cardInQuestion = newGame.cards[boardId - 1];
    if (!cardInQuestion) return { success: false, message: 'Invalid board position' };

    if (TWO_EYED_JACK_IDS.has(selectedCardId)) {
        // Wild: place chip on any empty non-corner space
        if (CORNER_IDS.includes(boardId)) return { success: false, message: 'Cannot place on corner' };
        if (cardInQuestion.selected === 'True') return { success: false, message: 'Space already occupied' };
        cardInQuestion.selected = 'True';
        cardInQuestion.selectedby = teamColor;

    } else if (ONE_EYED_JACK_IDS.has(selectedCardId)) {
        // Removal: remove any opponent chip not in a locked sequence
        if (cardInQuestion.selected !== 'True') return { success: false, message: 'No chip to remove' };
        if (cardInQuestion.selectedby === teamColor) return { success: false, message: 'Cannot remove own chip' };
        if (CORNER_IDS.includes(boardId)) return { success: false, message: 'Cannot remove corner' };
        if (isInLockedSequence(boardId, newGame.protectedPatterns)) {
            return { success: false, message: 'That chip is locked in a completed sequence' };
        }
        cardInQuestion.selected = false;
        cardInQuestion.selectedby = '';

    } else {
        // Normal card
        if (CORNER_IDS.includes(boardId)) return { success: false, message: 'Cannot play on corner' };
        if (cardInQuestion.selected === 'True') return { success: false, message: 'Space already occupied' };
        if (!cardFromHand.matches || !cardFromHand.matches.includes(boardId)) {
            return { success: false, message: 'Card does not match board space' };
        }
        cardInQuestion.selected = 'True';
        cardInQuestion.selectedby = teamColor;
    }

    // Remove card from hand, draw replacement
    playerHand.splice(cardFromHandIndex, 1);
    if (newGame.shuffledDeck.length > 0) {
        playerHand.push(newGame.shuffledDeck.shift());
    }
    currentPlayer.hand = playerHand;

    // Advance turn
    const { nextTurn, nextIndex } = advanceTurn(newGame, currentTurn);
    newGame.players[currentTurn].isTurn = false;
    newGame.players[nextTurn].isTurn = true;
    newGame.currentTurnIndex = nextIndex;

    return { success: true, game: newGame, currentPlayer: currentTurn, nextPlayer: nextTurn };
}

// ── advanceTurn ───────────────────────────────────────────────

function advanceTurn(game, currentTurnKey) {
    const order = game.turnOrder || Object.keys(game.players);
    const idx = order.indexOf(currentTurnKey);
    const nextIndex = (idx + 1) % order.length;
    return { nextTurn: order[nextIndex], nextIndex };
}

// ── checkPatterns ─────────────────────────────────────────────

/**
 * Scans the board for newly-completed sequences of 5.
 * Corners act as wild chips for any color.
 * At most 1 chip may be shared between two sequences.
 */
function checkPatterns(game) {
    let newGame = JSON.parse(JSON.stringify(game));
    newGame.protectedPatterns = newGame.protectedPatterns || [];

    // Build 10×10 board matrix: { color, index }
    const board = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
            const id = r * 10 + c + 1;
            const card = newGame.cards[id - 1];
            return {
                color: card?.selectedby || null,
                isCorner: CORNER_IDS.includes(id),
                index: id,
            };
        })
    );

    const existingPatterns = newGame.protectedPatterns;

    /**
     * True if all indices in `newPat` are already covered by one existing pattern.
     */
    const isAlreadyCounted = (newPat) =>
        existingPatterns.some(ep => newPat.every(i => ep.includes(i)));

    /**
     * True if newPat shares ≤ 1 chip with each existing pattern.
     */
    const hasValidOverlap = (newPat) =>
        existingPatterns.every(ep => {
            const shared = newPat.filter(i => ep.includes(i)).length;
            return shared <= 1;
        });

    const effectiveColor = (cell, color) =>
        cell.isCorner ? color : (cell.color === color ? color : null);

    /**
     * Scan an array of cells for a run of 5 with the given color (corners = wild).
     * Returns all found new sequences.
     */
    const findSequences = (cells, color) => {
        const found = [];
        let run = [];
        for (const cell of cells) {
            if (effectiveColor(cell, color) === color) {
                run.push(cell.index);
                if (run.length === 5) {
                    const pat = [...run];
                    if (!isAlreadyCounted(pat) && hasValidOverlap(pat)) {
                        found.push(pat);
                    }
                    // Allow sliding window past locked subsequences (9-in-a-row = 2)
                    run.shift();
                }
            } else {
                run = [];
            }
        }
        return found;
    };

    const runForColor = (color) => {
        const newSeqs = [];

        // Rows
        for (let r = 0; r < 10; r++) {
            newSeqs.push(...findSequences(board[r], color));
        }

        // Columns
        for (let c = 0; c < 10; c++) {
            newSeqs.push(...findSequences(board.map(row => row[c]), color));
        }

        // Down-right diagonals
        for (let r = 0; r < 10; r++) {
            const diag = [];
            for (let d = 0; r + d < 10 && d < 10; d++) diag.push(board[r + d][d]);
            if (diag.length >= 5) newSeqs.push(...findSequences(diag, color));
        }
        for (let c = 1; c < 10; c++) {
            const diag = [];
            for (let d = 0; c + d < 10 && d < 10; d++) diag.push(board[d][c + d]);
            if (diag.length >= 5) newSeqs.push(...findSequences(diag, color));
        }

        // Up-right diagonals
        for (let r = 9; r >= 0; r--) {
            const diag = [];
            for (let d = 0; r - d >= 0 && d < 10; d++) diag.push(board[r - d][d]);
            if (diag.length >= 5) newSeqs.push(...findSequences(diag, color));
        }
        for (let c = 1; c < 10; c++) {
            const diag = [];
            for (let d = 0; d < 10 && c + d < 10; d++) diag.push(board[9 - d][c + d]);
            if (diag.length >= 5) newSeqs.push(...findSequences(diag, color));
        }

        for (const seq of newSeqs) {
            newGame.protectedPatterns.push(seq);
            newGame.scores[color] = (newGame.scores[color] || 0) + 1;
        }
    };

    // Only check colors that have players
    const colors = [...new Set(Object.values(newGame.players).map(p => p.team))];
    colors.forEach(runForColor);

    const sequencesToWin = newGame.config?.sequencesToWin ?? 2;

    // For team games: sum scores per team color
    let winner = null;
    for (const color of colors) {
        if ((newGame.scores[color] || 0) >= sequencesToWin) {
            winner = color;
            break;
        }
    }

    return { winner, game: newGame };
}

// ── getValidMoves ─────────────────────────────────────────────

/**
 * Returns an array of valid moves for the current player.
 * Each move: { card, boardId, actionType }
 */
function getValidMoves(game, playerKey) {
    const player = game.players[playerKey];
    if (!player) return [];

    const moves = [];
    const { cards, protectedPatterns } = game;
    const teamColor = player.team;

    for (const card of player.hand) {
        if (isDeadCard(card, cards)) {
            moves.push({ card, boardId: null, actionType: 'DISCARD_DEAD_CARD' });
            continue;
        }

        if (TWO_EYED_JACK_IDS.has(card.id)) {
            // Can place on any empty non-corner
            for (const bc of cards) {
                if (!CORNER_IDS.includes(bc.id) && bc.selected !== 'True') {
                    moves.push({ card, boardId: bc.id, actionType: 'PLAY_CARD' });
                }
            }
        } else if (ONE_EYED_JACK_IDS.has(card.id)) {
            // Can remove any unlocked opponent chip
            for (const bc of cards) {
                if (
                    bc.selected === 'True' &&
                    bc.selectedby !== teamColor &&
                    !CORNER_IDS.includes(bc.id) &&
                    !isInLockedSequence(bc.id, protectedPatterns)
                ) {
                    moves.push({ card, boardId: bc.id, actionType: 'PLAY_CARD' });
                }
            }
        } else {
            // Normal: play on matching unoccupied space
            if (card.matches) {
                for (const boardId of card.matches) {
                    const bc = cards[boardId - 1];
                    if (bc && bc.selected !== 'True' && !CORNER_IDS.includes(boardId)) {
                        moves.push({ card, boardId, actionType: 'PLAY_CARD' });
                    }
                }
            }
        }
    }

    return moves;
}

// ── getBoardMatrix ───────────────────────────────────────────

/**
 * Returns a 10×10 number[][] representing the board state:
 *  -2 = locked (part of a completed sequence)
 *  -1 = corner (wild)
 *   0 = empty
 *   1 = team index 0 (blue)
 *   2 = team index 1 (red)
 *   3 = team index 2 (green)
 */
function getBoardMatrix(game) {
    const TEAM_IDX = { blue: 1, red: 2, green: 3 };
    const lockedIds = new Set(game.protectedPatterns.flat());

    return Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
            const id = r * 10 + c + 1;
            if (CORNER_IDS.includes(id)) return -1;
            if (lockedIds.has(id)) return -2;
            const card = game.cards[id - 1];
            if (!card || card.selected !== 'True') return 0;
            return TEAM_IDX[card.selectedby] || 0;
        })
    );
}

// ── applyMove ────────────────────────────────────────────────

/**
 * Unified interface for human and bot players.
 * @param {Object} game
 * @param {Object} action  { playerId, actionType, card, targetPosition? }
 * @returns {{ success, game?, winner?, error? }}
 */
function applyMove(game, action) {
    const { playerId, actionType, card, targetPosition } = action;
    const boardId = targetPosition ? targetPosition.row * 10 + targetPosition.col + 1 : null;

    const selResult = handleCardSelection(game, boardId, playerId, card.id, actionType);
    if (!selResult.success) return { success: false, error: selResult.message };

    const patResult = checkPatterns(selResult.game);
    return { success: true, game: patResult.game, winner: patResult.winner };
}

// ── Exports ──────────────────────────────────────────────────

module.exports = {
    // Core
    shuffleDeck,
    initializeGame,
    handleCardSelection,
    checkPatterns,
    advanceTurn,
    // AI interface
    getValidMoves,
    getBoardMatrix,
    applyMove,
    // Helpers (exported for testing)
    getHandSize,
    deriveSequencesToWin,
    deriveNumTeams,
    isDeadCard,
    isInLockedSequence,
    buildTurnOrder,
    CORNER_IDS,
    TWO_EYED_JACK_IDS,
    ONE_EYED_JACK_IDS,
};
