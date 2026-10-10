// ============================================================
//  Sequence Game Engine  —  Official Rules Implementation
//  Pure functions, no I/O, no transport concerns.
//  ESModule version (frontend)
// ============================================================

export const CORNER_IDS = [1, 10, 91, 100];

// Official hand sizes keyed by total player count
export const HAND_SIZE_MAP = { 2: 7, 3: 6, 4: 6, 6: 5, 8: 4, 9: 4, 10: 3, 12: 3 };

// Jack card IDs (two decks → two copies each)
// Two-Eyed (Wild)   : Jack of Diamonds (101,102), Jack of Clubs (103,104)
// One-Eyed (Removal): Jack of Spades (105,106), Jack of Hearts (107,108)
export const TWO_EYED_JACK_IDS = new Set([101, 102, 103, 104]);
export const ONE_EYED_JACK_IDS = new Set([105, 106, 107, 108]);

// ── Helpers ──────────────────────────────────────────────────

export function isCellOccupied(cell) {
    return Boolean(cell && (cell.selected === 'True' || cell.selected === true));
}

export function shuffleDeck(cards) {
    const arr = cards.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function getHandSize(numPlayers) {
    return HAND_SIZE_MAP[numPlayers] || 6;
}

export function deriveSequencesToWin(numTeams) {
    return numTeams === 3 ? 1 : 2;
}

export function deriveNumTeams(numPlayers) {
    if (numPlayers <= 3) return numPlayers;
    if ([6, 9, 12].includes(numPlayers)) return 3;
    return 2;
}

export const TEAM_COLORS = ['blue', 'red', 'green'];

export function buildTurnOrder(numPlayers, numTeams) {
    const keys = [];
    if (numTeams === numPlayers) {
        for (let i = 0; i < numPlayers; i++) keys.push(`player${i + 1}`);
        return keys;
    }
    const playersPerTeam = numPlayers / numTeams;
    for (let round = 0; round < playersPerTeam; round++) {
        for (let team = 0; team < numTeams; team++) {
            keys.push(`player${team * playersPerTeam + round + 1}`);
        }
    }
    return keys;
}

export function isInLockedSequence(boardId, protectedPatterns) {
    if (!protectedPatterns || !Array.isArray(protectedPatterns)) return false;
    return protectedPatterns.some(pattern => pattern.includes(boardId));
}

export function isDeadCard(handCard, boardCards) {
    if (!handCard || !handCard.matches || handCard.matches.length === 0) return false;
    const cardIdNum = Number(handCard.id);
    if (TWO_EYED_JACK_IDS.has(cardIdNum) || ONE_EYED_JACK_IDS.has(cardIdNum)) return false;
    return handCard.matches.every(boardId => {
        const bc = boardCards[boardId - 1];
        return isCellOccupied(bc) || CORNER_IDS.includes(boardId);
    });
}

// ── initializeGame ───────────────────────────────────────────

export function initializeGame(allCards, config = {}) {
    const numPlayers = config.numPlayers || 2;
    const numTeams = config.numTeams || deriveNumTeams(numPlayers);
    const sequencesToWin = deriveSequencesToWin(numTeams);
    const handSize = getHandSize(numPlayers);
    const playerNames = config.playerNames || [];

    const initialDeck = shuffleDeck(
        allCards.filter(c => !CORNER_IDS.includes(c.id) && c.id <= 108)
    );

    const players = {};
    const scores = {};
    const turnOrder = buildTurnOrder(numPlayers, numTeams);

    for (let i = 0; i < numPlayers; i++) {
        const key = `player${i + 1}`;
        const teamIndex = numTeams === numPlayers ? i : i % numTeams;
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
    const boardCards = JSON.parse(JSON.stringify(allCards.filter(c => c.id <= 100)));

    return {
        config: { numPlayers, numTeams, sequencesToWin, handSize },
        players,
        scores,
        shuffledDeck: remainingDeck,
        cards: boardCards,
        protectedPatterns: [],
        turnOrder,
        currentTurnIndex: 0,
    };
}

// ── advanceTurn ───────────────────────────────────────────────

export function advanceTurn(game, currentTurnKey) {
    const order = game.turnOrder || Object.keys(game.players);
    const idx = order.indexOf(currentTurnKey);
    const nextIndex = (idx + 1) % order.length;
    return { nextTurn: order[nextIndex], nextIndex };
}

// ── handleCardSelection ──────────────────────────────────────

export function handleCardSelection(game, boardId, currentTurn, selectedCardId, actionType = 'PLAY_CARD') {
    let newGame = JSON.parse(JSON.stringify(game));
    const currentPlayer = newGame.players[currentTurn];
    if (!currentPlayer) return { success: false, message: 'Invalid player' };

    const playerHand = currentPlayer.hand;
    const cardFromHandIndex = playerHand.findIndex(c => c.id === selectedCardId);
    if (cardFromHandIndex === -1) return { success: false, message: 'Card not in hand' };

    const cardFromHand = playerHand[cardFromHandIndex];
    const teamColor = currentPlayer.team;
    const cardIdNum = Number(selectedCardId);

    // ── DISCARD_DEAD_CARD ─────────────────────────────────────
    if (actionType === 'DISCARD_DEAD_CARD') {
        if (!isDeadCard(cardFromHand, newGame.cards)) {
            return { success: false, message: 'Card is not dead — both board spaces must be occupied' };
        }
        playerHand.splice(cardFromHandIndex, 1);
        if (newGame.shuffledDeck.length > 0) playerHand.push(newGame.shuffledDeck.shift());
        currentPlayer.hand = playerHand;

        // In official Sequence rules, player replaces dead card and takes their turn
        return { success: true, game: newGame, currentPlayer: currentTurn, nextPlayer: currentTurn, wasDeadCard: true };
    }

    // ── PLAY_CARD ─────────────────────────────────────────────
    const cardInQuestion = newGame.cards[boardId - 1];
    if (!cardInQuestion) return { success: false, message: 'Invalid board position' };

    const occupied = isCellOccupied(cardInQuestion);

    if (TWO_EYED_JACK_IDS.has(cardIdNum)) {
        if (CORNER_IDS.includes(boardId)) return { success: false, message: 'Cannot place on corner' };
        if (occupied) return { success: false, message: 'Space already occupied' };
        cardInQuestion.selected = 'True';
        cardInQuestion.selectedby = teamColor;

    } else if (ONE_EYED_JACK_IDS.has(cardIdNum)) {
        if (!occupied) return { success: false, message: 'No chip to remove' };
        if (cardInQuestion.selectedby === teamColor) return { success: false, message: 'Cannot remove own chip' };
        if (CORNER_IDS.includes(boardId)) return { success: false, message: 'Cannot remove corner' };
        if (isInLockedSequence(boardId, newGame.protectedPatterns)) {
            return { success: false, message: 'That chip is locked in a completed sequence' };
        }
        cardInQuestion.selected = false;
        cardInQuestion.selectedby = '';

    } else {
        if (CORNER_IDS.includes(boardId)) return { success: false, message: 'Cannot play on corner' };
        if (occupied) return { success: false, message: 'Space already occupied' };
        if (!cardFromHand.matches || !cardFromHand.matches.includes(boardId)) {
            return { success: false, message: 'Card does not match board space' };
        }
        cardInQuestion.selected = 'True';
        cardInQuestion.selectedby = teamColor;
    }

    playerHand.splice(cardFromHandIndex, 1);
    if (newGame.shuffledDeck.length > 0) playerHand.push(newGame.shuffledDeck.shift());
    currentPlayer.hand = playerHand;

    const { nextTurn, nextIndex } = advanceTurn(newGame, currentTurn);
    newGame.players[currentTurn].isTurn = false;
    newGame.players[nextTurn].isTurn = true;
    newGame.currentTurnIndex = nextIndex;

    return { success: true, game: newGame, currentPlayer: currentTurn, nextPlayer: nextTurn };
}

// ── checkPatterns ─────────────────────────────────────────────

export function checkPatterns(game) {
    let newGame = JSON.parse(JSON.stringify(game));
    newGame.protectedPatterns = newGame.protectedPatterns || [];

    const board = Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
            const id = r * 10 + c + 1;
            const card = newGame.cards[id - 1];
            const occupied = isCellOccupied(card);
            return {
                color: occupied ? (card?.selectedby || null) : null,
                isCorner: CORNER_IDS.includes(id),
                index: id,
            };
        })
    );

    const existingPatterns = newGame.protectedPatterns;

    const isAlreadyCounted = (newPat) =>
        existingPatterns.some(ep => newPat.every(i => ep.includes(i)));

    const hasValidOverlap = (newPat) =>
        existingPatterns.every(ep => {
            const shared = newPat.filter(i => ep.includes(i)).length;
            return shared <= 1;
        });

    const effectiveColor = (cell, color) =>
        cell.isCorner ? color : (cell.color === color ? color : null);

    const scanCellArray = (cells, color) => {
        let run = [];
        for (const cell of cells) {
            if (effectiveColor(cell, color) === color) {
                run.push(cell.index);
                if (run.length === 5) {
                    const pat = [...run];
                    if (!isAlreadyCounted(pat) && hasValidOverlap(pat)) {
                        existingPatterns.push(pat);
                        newGame.scores[color] = (newGame.scores[color] || 0) + 1;
                    }
                    run.shift();
                }
            } else {
                run = [];
            }
        }
    };

    const runForColor = (color) => {
        // Rows
        for (let r = 0; r < 10; r++) scanCellArray(board[r], color);

        // Columns
        for (let c = 0; c < 10; c++) scanCellArray(board.map(row => row[c]), color);

        // Down-right diagonals
        for (let r = 0; r < 10; r++) {
            const diag = [];
            for (let d = 0; r + d < 10 && d < 10; d++) diag.push(board[r + d][d]);
            if (diag.length >= 5) scanCellArray(diag, color);
        }
        for (let c = 1; c < 10; c++) {
            const diag = [];
            for (let d = 0; c + d < 10 && d < 10; d++) diag.push(board[d][c + d]);
            if (diag.length >= 5) scanCellArray(diag, color);
        }

        // Up-right diagonals
        for (let r = 9; r >= 0; r--) {
            const diag = [];
            for (let d = 0; r - d >= 0 && d < 10; d++) diag.push(board[r - d][d]);
            if (diag.length >= 5) scanCellArray(diag, color);
        }
        for (let c = 1; c < 10; c++) {
            const diag = [];
            for (let d = 0; d < 10 && c + d < 10; d++) diag.push(board[9 - d][c + d]);
            if (diag.length >= 5) scanCellArray(diag, color);
        }
    };

    const colors = [...new Set(Object.values(newGame.players).map(p => p.team))];
    colors.forEach(runForColor);

    const sequencesToWin = newGame.config?.sequencesToWin ?? 2;

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

export function getValidMoves(game, playerKey) {
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

        const cardIdNum = Number(card.id);

        if (TWO_EYED_JACK_IDS.has(cardIdNum)) {
            for (const bc of cards) {
                if (!CORNER_IDS.includes(bc.id) && !isCellOccupied(bc)) {
                    moves.push({ card, boardId: bc.id, actionType: 'PLAY_CARD' });
                }
            }
        } else if (ONE_EYED_JACK_IDS.has(cardIdNum)) {
            for (const bc of cards) {
                if (
                    isCellOccupied(bc) &&
                    bc.selectedby !== teamColor &&
                    !CORNER_IDS.includes(bc.id) &&
                    !isInLockedSequence(bc.id, protectedPatterns)
                ) {
                    moves.push({ card, boardId: bc.id, actionType: 'PLAY_CARD' });
                }
            }
        } else {
            if (card.matches) {
                for (const boardId of card.matches) {
                    const bc = cards[boardId - 1];
                    if (bc && !isCellOccupied(bc) && !CORNER_IDS.includes(boardId)) {
                        moves.push({ card, boardId, actionType: 'PLAY_CARD' });
                    }
                }
            }
        }
    }

    return moves;
}

// ── getBoardMatrix ───────────────────────────────────────────

export function getBoardMatrix(game) {
    const TEAM_IDX = { blue: 1, red: 2, green: 3 };
    const lockedIds = new Set((game.protectedPatterns || []).flat());

    return Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
            const id = r * 10 + c + 1;
            if (CORNER_IDS.includes(id)) return -1;
            if (lockedIds.has(id)) return -2;
            const card = game.cards[id - 1];
            if (!isCellOccupied(card)) return 0;
            return TEAM_IDX[card.selectedby] || 0;
        })
    );
}

// ── applyMove ────────────────────────────────────────────────

export function applyMove(game, action) {
    const { playerId, actionType, card, targetPosition } = action;
    const boardId = targetPosition ? targetPosition.row * 10 + targetPosition.col + 1 : null;

    const selResult = handleCardSelection(game, boardId, playerId, card.id, actionType);
    if (!selResult.success) return { success: false, error: selResult.message };

    const patResult = checkPatterns(selResult.game);
    return { success: true, game: patResult.game, winner: patResult.winner };
}
