// ============================================================
//  botPlayer.js — CPU Bot Scaffold
//  Implements the same PlayerAction interface as human players.
//  Future AI strategies can replace computeMove() logic.
// ============================================================

const { getValidMoves, applyMove } = require('./gameEngine');

class BotPlayer {
    /**
     * @param {string} playerId   e.g. 'player3'
     * @param {'random'|'smart'} difficulty
     * @param {number} thinkMs  Simulated thinking delay in ms (default 800)
     */
    constructor(playerId, difficulty = 'random', thinkMs = 800) {
        this.playerId = playerId;
        this.difficulty = difficulty;
        this.thinkMs = thinkMs;
        this.isCpu = true;
    }

    /**
     * Compute the next move. Returns a Promise that resolves to a PlayerAction.
     * @param {Object} game  Full game state
     * @returns {Promise<Object|null>}  PlayerAction or null if no valid moves
     */
    async computeMove(game) {
        const moves = getValidMoves(game, this.playerId);
        if (!moves || moves.length === 0) return null;

        await this._think();

        switch (this.difficulty) {
            case 'random':
            default:
                return this._randomMove(moves, game);
        }
    }

    // ── Strategy: random ─────────────────────────────────────

    _randomMove(moves, _game) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        return this._toAction(move);
    }

    // ── Helper ───────────────────────────────────────────────

    _toAction(move) {
        const action = {
            playerId:   this.playerId,
            actionType: move.actionType,
            card:       move.card,
        };
        if (move.boardId != null) {
            const row = Math.floor((move.boardId - 1) / 10);
            const col = (move.boardId - 1) % 10;
            action.targetPosition = { row, col };
        }
        return action;
    }

    _think() {
        return new Promise(resolve => setTimeout(resolve, this.thinkMs));
    }
}

/**
 * Apply a CPU bot's turn to the game state.
 * Returns { success, game, winner, action } or { success: false, error }.
 */
async function runBotTurn(game, botPlayer) {
    const action = await botPlayer.computeMove(game);
    if (!action) return { success: false, error: 'No valid moves for bot' };

    const result = applyMove(game, action);
    return { ...result, action };
}

module.exports = { BotPlayer, runBotTurn };
