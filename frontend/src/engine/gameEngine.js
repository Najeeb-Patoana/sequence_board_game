export function shuffleDeck(cards) {
    let shuffledCards = cards.slice();
    for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    return shuffledCards;
}

export function initializeGame(allCards, config = { numPlayers: 2, sequencesToWin: 2 }) {
    // Exclude corner wilds (1, 10, 91, 100) from deck
    const initialDeck = shuffleDeck(
        allCards.filter((card) => ![1, 10, 91, 100].includes(card.id))
    );
    
    // Calculate hand size based on standard sequence rules (2 players = 7 cards, 3 players = 6 cards)
    // Wait, original logic used 5 cards. We'll stick to original logic if we want, or use 6 for 2 players.
    // Let's use 6 cards for hand size as a standard, or just 5 to keep it consistent with previous state.
    const handSize = config.numPlayers === 3 ? 5 : 6; 
    
    const players = {};
    const scores = { blue: 0, red: 0 };
    
    players.player1 = { hand: initialDeck.slice(0, handSize), isTurn: true, name: "Player 1", team: "blue" };
    players.player2 = { hand: initialDeck.slice(handSize, handSize * 2), isTurn: false, name: "Player 2", team: "red" };
    
    if (config.numPlayers === 3) {
        players.player3 = { hand: initialDeck.slice(handSize * 2, handSize * 3), isTurn: false, name: "Player 3", team: "green" };
        scores.green = 0;
    }

    const remainingDeck = initialDeck.slice(handSize * config.numPlayers);

    return {
        config,
        players,
        scores,
        shuffledDeck: remainingDeck,
        cards: JSON.parse(JSON.stringify(allCards.filter(c => c.id <= 100))),
        protectedPatterns: [],
    };
}

export function handleCardSelection(game, cardId, currentTurn, selectedCardId) {
    let newGame = JSON.parse(JSON.stringify(game));
    let cardIndex = cardId - 1; 
    let currentPlayer = currentTurn;
    
    let playerHand = newGame.players[currentPlayer].hand;
    let cardFromHandIndex = playerHand.findIndex(c => c.id === selectedCardId);
    
    if (cardFromHandIndex === -1) {
        return { success: false, message: "Card not in hand" };
    }
    let cardFromHand = playerHand[cardFromHandIndex];
    let cardInQuestion = newGame.cards[cardIndex];
    let teamColor = newGame.players[currentPlayer].team;

    const isCardProtected = (cardIdx, protectedPatterns) => newGame.protectedPatterns.includes(cardIdx);

    // Validate move logic
    if (selectedCardId > 104 && selectedCardId <= 108) {
        // One-Eyed Jack: Remove opponent token
        if (cardInQuestion.selected !== "True") return { success: false, message: "Empty space" };
        if (cardInQuestion.selectedby === teamColor) return { success: false, message: "Cannot remove own token" };
        if (isCardProtected(cardInQuestion.id, newGame.protectedPatterns)) return { success: false, message: "Protected" };
        
        cardInQuestion.selected = false;
        cardInQuestion.selectedby = "";
    } else if (selectedCardId > 100 && selectedCardId <= 104) {
        // Two-Eyed Jack: Place token anywhere empty
        if (cardInQuestion.selected === "True") return { success: false, message: "Already occupied" };
        cardInQuestion.selected = "True";
        cardInQuestion.selectedby = teamColor;
    } else {
        // Normal card
        if (cardInQuestion.selected === "True") return { success: false, message: "Already occupied" };
        if (!cardFromHand.matches || !cardFromHand.matches.includes(cardId)) {
            return { success: false, message: "Card does not match board space" };
        }
        cardInQuestion.selected = "True";
        cardInQuestion.selectedby = teamColor;
    }

    // Remove from hand
    playerHand.splice(cardFromHandIndex, 1);

    // Draw new card
    if (newGame.shuffledDeck.length > 0) {
        playerHand.push(newGame.shuffledDeck.shift());
    }

    // Next turn
    let numPlayers = Object.keys(newGame.players).length;
    let nextPlayer = 'player1';
    if (currentPlayer === 'player1') nextPlayer = 'player2';
    else if (currentPlayer === 'player2') nextPlayer = numPlayers === 3 ? 'player3' : 'player1';
    else if (currentPlayer === 'player3') nextPlayer = 'player1';

    newGame.players[currentPlayer].isTurn = false;
    newGame.players[nextPlayer].isTurn = true;
    newGame.players[currentPlayer].hand = playerHand;

    return { success: true, game: newGame, currentPlayer, nextPlayer };
}

export function checkPatterns(game) {
    let newGame = JSON.parse(JSON.stringify(game));
    let board = Array(10).fill(null).map(() => Array(10).fill({ color: null, isPartOfPattern: false, index: -1 }));
    newGame.protectedPatterns = newGame.protectedPatterns || [];
    const cornerIndices = [1, 10, 91, 100];

    const getPositionFromId = (id) => {
        let row = Math.floor((id - 1) / 10);
        let col = (id - 1) % 10;
        return { row, col };
    };

    if (Array.isArray(newGame.cards)) {
        newGame.cards.forEach((card) => {
            if (card.selected === "True") {
                const { row, col } = getPositionFromId(card.id);
                board[row][col] = { color: card.selectedby, isPartOfPattern: false, index: card.id };
            }
        });
    }

    const isCornerIndex = (index) => cornerIndices.includes(index);

    const checkConsecutive = (arr, color) => {
        let count = 0;
        let patternIndices = [];
        for (let i = 0; i < arr.length; i++) {
            let cell = arr[i];
            let effectiveColor = cell.color || (isCornerIndex(cell.index) ? color : null);
            if (effectiveColor === color) {
                count++;
                patternIndices.push(cell.index);
                if (count >= 5) {
                    if (isPatternNew(patternIndices)) {
                        return { isPattern: true, patternIndices };
                    }
                }
            } else {
                count = 0;
                patternIndices = [];
            }
        }
        return { isPattern: false, patternIndices: [] };
    };

    const isPatternNew = (patternIndices) => {
        let existingPatterns = newGame.protectedPatterns || [];
        let isEntirelyNew = !existingPatterns.some(pattern =>
            patternIndices.every(index => pattern.includes(index))
        );
        let isValidOverlap = existingPatterns.map(pattern =>
            patternIndices.filter(index => pattern.includes(index)).length
        ).every(count => count <= 1);

        return isEntirelyNew && isValidOverlap;
    };

    const addProtectedPattern = (pattern) => {
        newGame.protectedPatterns = newGame.protectedPatterns || [];
        newGame.protectedPatterns.push(pattern);
    };

    const runPatternCheck = (color) => {
        const getSequencesOfFive = (arr) => {
            let sequences = [];
            for (let i = 0; i <= arr.length - 5; i++) {
                sequences.push(arr.slice(i, i + 5));
            }
            return sequences;
        };

        const getDownRightDiagonal = (startRow, startCol) => {
            let cells = [];
            for (let i = 0; startRow + i < 10 && startCol + i < 10; i++) {
                cells.push({ ...board[startRow + i][startCol + i], index: (startRow + i) * 10 + startCol + i + 1 });
            }
            return cells;
        };

        const getUpRightDiagonal = (startRow, startCol) => {
            let cells = [];
            for (let i = 0; startRow - i >= 0 && startCol + i < 10; i++) {
                cells.push({ ...board[startRow - i][startCol + i], index: (startRow - i) * 10 + startCol + i + 1 });
            }
            return cells;
        };

        const getDiagonals = (board, getDiagonalCells) => {
            let diagonals = [];
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 10; col++) {
                    let diagonalCells = getDiagonalCells(row, col, board);
                    if (diagonalCells.length >= 5) {
                        diagonals.push(diagonalCells);
                    }
                }
            }
            return diagonals;
        };

        const allDiagonals = [
            ...getDiagonals(board, getDownRightDiagonal),
            ...getDiagonals(board, getUpRightDiagonal)
        ];

        allDiagonals.forEach(diagonal => {
            getSequencesOfFive(diagonal).forEach(sequence => {
                let result = checkConsecutive(sequence, color);
                if (result.isPattern && isPatternNew(result.patternIndices)) {
                    addProtectedPattern(result.patternIndices);
                    newGame.scores[color] += 1;
                }
            });
        });

        for (let i = 0; i < 10; i++) {
            let row = board[i].map((cell, index) => ({ ...cell, index: i * 10 + index + 1 }));
            getSequencesOfFive(row).forEach(sequence => {
                let rowResult = checkConsecutive(sequence, color);
                if (rowResult.isPattern && isPatternNew(rowResult.patternIndices)) {
                    addProtectedPattern(rowResult.patternIndices);
                    newGame.scores[color] += 1;
                }
            });

            let col = board.map((_, rowIndex) => board[rowIndex][i]).map((cell, index) => ({ ...cell, index: index * 10 + i + 1 }));
            getSequencesOfFive(col).forEach(sequence => {
                let colResult = checkConsecutive(sequence, color);
                if (colResult.isPattern && isPatternNew(colResult.patternIndices)) {
                    addProtectedPattern(colResult.patternIndices);
                    newGame.scores[color] += 1;
                }
            });
        }
    };

    let colorsToCheck = ["blue", "red"];
    if (newGame.players && newGame.players.player3) {
        colorsToCheck.push("green");
    }
    
    colorsToCheck.forEach(color => runPatternCheck(color));
    
    let sequencesToWin = newGame.config ? newGame.config.sequencesToWin : 2;
    let winner = Object.keys(newGame.scores).find(color => newGame.scores[color] >= sequencesToWin) || null;
    return { winner, game: newGame };
}
