const assert = require('assert');
const gameEngine = require('./gameEngine');
const allCards = require('./allCards');

console.log('=== RUNNING SEQUENCE GAME ENGINE & JACK TESTS ===\n');

// 1. Initialize Game
const game = gameEngine.initializeGame(allCards, { numPlayers: 2 });
assert.strictEqual(Object.keys(game.players).length, 2);
assert.strictEqual(game.config.sequencesToWin, 2);
console.log('[PASS] Initialized 2P game successfully');

// 2. Two-Eyed Jack Tests (101, 102, 103, 104)
console.log('\n--- Two-Eyed Jack (Wild) Tests ---');
const twoEyedCardId = 101; // Jack of Diamonds
assert(gameEngine.TWO_EYED_JACK_IDS.has(twoEyedCardId), '101 should be Two-Eyed Jack');

// Place player1 chip at position 15 using Two-Eyed Jack
game.players.player1.hand = [{ id: 101, name: 'Jack of Diamonds', matches: [] }];
const moveResult1 = gameEngine.handleCardSelection(game, 15, 'player1', 101, 'PLAY_CARD');
assert(moveResult1.success, 'Two-Eyed Jack should place on empty space');
assert.strictEqual(moveResult1.game.cards[14].selected, 'True');
assert.strictEqual(moveResult1.game.cards[14].selectedby, 'blue');
console.log('[PASS] Two-Eyed Jack placed chip on empty space 15');

// Attempt to place Two-Eyed Jack on corner (id: 1)
const moveCorner = gameEngine.handleCardSelection(moveResult1.game, 1, 'player2', 101, 'PLAY_CARD');
assert(!moveCorner.success, 'Two-Eyed Jack must NOT place on corner');
console.log('[PASS] Two-Eyed Jack correctly rejected on corner');

// Attempt to place Two-Eyed Jack on already occupied space (id: 15)
moveResult1.game.players.player2.hand = [{ id: 102, name: 'Jack of Diamonds', matches: [] }];
const moveOccupied = gameEngine.handleCardSelection(moveResult1.game, 15, 'player2', 102, 'PLAY_CARD');
assert(!moveOccupied.success, 'Two-Eyed Jack must NOT place on occupied space');
console.log('[PASS] Two-Eyed Jack correctly rejected on occupied space');

// 3. One-Eyed Jack Tests (105, 106, 107, 108)
console.log('\n--- One-Eyed Jack (Removal) Tests ---');
const oneEyedCardId = 105; // Jack of Spades
assert(gameEngine.ONE_EYED_JACK_IDS.has(oneEyedCardId), '105 should be One-Eyed Jack');

// Player2 (red) removes player1 (blue) chip at space 15
moveResult1.game.players.player2.hand = [{ id: 105, name: 'Jack of Spades', matches: [] }];
const removeResult = gameEngine.handleCardSelection(moveResult1.game, 15, 'player2', 105, 'PLAY_CARD');
assert(removeResult.success, 'One-Eyed Jack should remove opponent chip');
assert.strictEqual(removeResult.game.cards[14].selected, false);
assert.strictEqual(removeResult.game.cards[14].selectedby, '');
console.log('[PASS] One-Eyed Jack removed opponent chip at space 15');

// Attempt to remove from empty space
const removeEmpty = gameEngine.handleCardSelection(removeResult.game, 15, 'player1', 105, 'PLAY_CARD');
removeResult.game.players.player1.hand = [{ id: 105, name: 'Jack of Spades', matches: [] }];
assert(!removeEmpty.success, 'One-Eyed Jack cannot remove from empty space');
console.log('[PASS] One-Eyed Jack correctly rejected on empty space');

// Attempt to remove own chip
// First place blue chip at space 20
removeResult.game.cards[19].selected = 'True';
removeResult.game.cards[19].selectedby = 'blue';
const removeOwn = gameEngine.handleCardSelection(removeResult.game, 20, 'player1', 105, 'PLAY_CARD');
assert(!removeOwn.success, 'One-Eyed Jack cannot remove own chip');
console.log('[PASS] One-Eyed Jack correctly rejected on own chip');

// Attempt to remove chip in completed/locked sequence
const testGameWithLocked = JSON.parse(JSON.stringify(game));
testGameWithLocked.protectedPatterns = [[11, 12, 13, 14, 15]];
testGameWithLocked.cards[10].selected = 'True';
testGameWithLocked.cards[10].selectedby = 'red';
testGameWithLocked.players.player1.hand = [{ id: 105, name: 'Jack of Spades', matches: [] }];
const removeLocked = gameEngine.handleCardSelection(testGameWithLocked, 11, 'player1', 105, 'PLAY_CARD');
assert(!removeLocked.success, 'One-Eyed Jack cannot remove locked chip');
console.log('[PASS] One-Eyed Jack correctly rejected on locked sequence chip');

// 4. Pattern Recognition & Sequence Overlap Rules
console.log('\n--- Sequence Overlap & Win Condition Tests ---');

// Test 5 in a row -> 1 sequence
const patternGame = JSON.parse(JSON.stringify(game));
[21, 22, 23, 24, 25].forEach(id => {
    patternGame.cards[id - 1].selected = 'True';
    patternGame.cards[id - 1].selectedby = 'blue';
});
const pat5 = gameEngine.checkPatterns(patternGame);
assert.strictEqual(pat5.game.scores.blue, 1, '5 in a row should be exactly 1 sequence');
console.log('[PASS] 5 in a row awards exactly 1 sequence');

// Test 6 in a row -> STILL ONLY 1 sequence (NOT 2 sequences)
const patternGame6 = JSON.parse(JSON.stringify(game));
[21, 22, 23, 24, 25, 26].forEach(id => {
    patternGame6.cards[id - 1].selected = 'True';
    patternGame6.cards[id - 1].selectedby = 'blue';
});
const pat6 = gameEngine.checkPatterns(patternGame6);
assert.strictEqual(pat6.game.scores.blue, 1, '6 in a row must be ONLY 1 sequence, not 2');
assert.strictEqual(pat6.winner, null, '6 in a row must NOT trigger win (needs 2 sequences)');
console.log('[PASS] 6 in a row correctly awards ONLY 1 sequence (fixed overlap bug)');

// Test 9 in a row -> 2 sequences (sharing exactly 1 chip at index 25)
const patternGame9 = JSON.parse(JSON.stringify(game));
[21, 22, 23, 24, 25, 26, 27, 28, 29].forEach(id => {
    patternGame9.cards[id - 1].selected = 'True';
    patternGame9.cards[id - 1].selectedby = 'blue';
});
const pat9 = gameEngine.checkPatterns(patternGame9);
assert.strictEqual(pat9.game.scores.blue, 2, '9 in a row awards 2 sequences (sharing 1 chip)');
assert.strictEqual(pat9.winner, 'blue', '2 sequences wins the game');
console.log('[PASS] 9 in a row correctly awards 2 sequences and wins');

// 5. Dead Card Tests
console.log('\n--- Dead Card Tests ---');
const normalCard = { id: 2, name: 'Two of Spades', matches: [2, 87] };
const deadGame = JSON.parse(JSON.stringify(game));
assert(!gameEngine.isDeadCard(normalCard, deadGame.cards), 'Card is not dead when spaces open');

deadGame.cards[1].selected = 'True';
deadGame.cards[1].selectedby = 'blue';
assert(!gameEngine.isDeadCard(normalCard, deadGame.cards), 'Card not dead when 1 space open');

deadGame.cards[86].selected = 'True';
deadGame.cards[86].selectedby = 'red';
assert(gameEngine.isDeadCard(normalCard, deadGame.cards), 'Card is dead when BOTH spaces occupied');
console.log('[PASS] Dead card correctly detected when both spaces occupied');

assert(!gameEngine.isDeadCard({ id: 101, matches: [] }, deadGame.cards), 'Two-Eyed Jack is never dead');
assert(!gameEngine.isDeadCard({ id: 105, matches: [] }, deadGame.cards), 'One-Eyed Jack is never dead');
console.log('[PASS] Jacks are never flagged as dead cards');

console.log('\n=======================================');
console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
console.log('=======================================');
