function shuffleDeck(cards) {
    let shuffledCards = cards.slice();
    for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    return shuffledCards;
}

function initializeGame(allCards) {
    // Exclude corner wilds (1, 10, 91, 100) from deck, as they are not playable cards
    const initialDeck = shuffleDeck(
        allCards.filter((card) => ![1, 10, 91, 100].includes(card.id))
    );
    const player1InitialHand = initialDeck.slice(0, 5);
    const player2InitialHand = initialDeck.slice(5, 10);
    const remainingDeck = initialDeck.slice(10);

    return {
        players: {
            player1: { hand: player1InitialHand, isTurn: true, socketId: null, name: null },
            player2: { hand: player2InitialHand, isTurn: false, socketId: null, name: null },
        },
        scores: {
            red: 0,
            blue: 0,
        },
        shuffledDeck: remainingDeck,
        cards: JSON.parse(JSON.stringify(allCards.filter(c => c.id <= 100))), // The board
        protectedPatterns: [],
    };
}

function handleCardSelection(game, cardId, currentTurn, selectedCard) {
    let cardIndex = cardId - 1; 
    let currentPlayer = currentTurn;
    let nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    let playerHand = game.players[currentPlayer].hand;
    let cardInQuestion = game.cards[cardIndex];

    const isCardProtected = (cardIdx, protectedPatterns) => {
        return protectedPatterns.includes(cardIdx);
    }

    // 101-104: Two-eyed jacks (wild card, place anywhere)
    if (selectedCard > 100 && selectedCard <= 104) {
        cardInQuestion.selected = "True";
        cardInQuestion.selectedby = currentPlayer == "player1" ? "blue" : "red";
    }
    // 105-108: One-eyed jacks (remove opponent's chip, if not protected)
    else if (selectedCard > 104 && selectedCard <= 108 && cardInQuestion.selected === "True") {
        if (!isCardProtected(cardInQuestion.id, game.protectedPatterns)) {
            cardInQuestion.selected = false;
            cardInQuestion.selectedby = "";
        } else {
            return { success: false, message: "Wrong move: Card is protected." };
        }
    }
    // Normal card
    else {
        cardInQuestion.selected = "True";
        cardInQuestion.selectedby = currentPlayer == "player1" ? "blue" : "red";
    }

    // Remove played card from hand
    let indexToRemove = playerHand.findIndex(
        (card) => card.id === selectedCard || (card.matches && card.matches.includes(cardId))
    );
    if (indexToRemove !== -1) {
        playerHand.splice(indexToRemove, 1);
    }

    // Draw new card
    if (game.shuffledDeck.length > 0) {
        let newCard = game.shuffledDeck.shift();
        playerHand.push(newCard);
    }

    // Update turn
    game.players[currentPlayer].isTurn = false;
    game.players[nextPlayer].isTurn = true;
    game.players[currentPlayer].hand = playerHand;

    return { success: true, game, currentPlayer, nextPlayer };
}

function checkPatterns(game) {
    let board = Array(10).fill(null).map(() => Array(10).fill({ color: null, isPartOfPattern: false, index: -1 }));
    game.protectedPatterns = game.protectedPatterns || [];
    const cornerIndices = [1, 10, 91, 100];

    const getPositionFromId = (id) => {
        let row = Math.floor((id - 1) / 10);
        let col = (id - 1) % 10;
        return { row, col };
    };

    if (Array.isArray(game.cards)) {
        game.cards.forEach((card) => {
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
            if (effectiveColor == color) {
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
        let existingPatterns = game.protectedPatterns || [];
        let isEntirelyNew = !existingPatterns.some(pattern =>
            patternIndices.every(index => pattern.includes(index))
        );
        let isValidOverlap = existingPatterns.map(pattern =>
            patternIndices.filter(index => pattern.includes(index)).length
        ).every(count => count <= 1);

        return isEntirelyNew && isValidOverlap;
    };

    const addProtectedPattern = (pattern) => {
        game.protectedPatterns = game.protectedPatterns || [];
        game.protectedPatterns.push(pattern);
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
                    game.scores[color] += 1;
                }
            });
        });

        for (let i = 0; i < 10; i++) {
            let row = board[i].map((cell, index) => ({ ...cell, index: i * 10 + index + 1 }));
            getSequencesOfFive(row).forEach(sequence => {
                let rowResult = checkConsecutive(sequence, color);
                if (rowResult.isPattern && isPatternNew(rowResult.patternIndices)) {
                    addProtectedPattern(rowResult.patternIndices);
                    game.scores[color] += 1;
                }
            });

            let col = board.map((_, rowIndex) => board[rowIndex][i]).map((cell, index) => ({ ...cell, index: index * 10 + i + 1 }));
            getSequencesOfFive(col).forEach(sequence => {
                let colResult = checkConsecutive(sequence, color);
                if (colResult.isPattern && isPatternNew(colResult.patternIndices)) {
                    addProtectedPattern(colResult.patternIndices);
                    game.scores[color] += 1;
                }
            });
        }
    };

    ["blue", "red"].forEach(color => runPatternCheck(color));
    let winner = Object.keys(game.scores).find(color => game.scores[color] >= 2) || null;
    return { winner, game };
}

module.exports = {
    shuffleDeck,
    initializeGame,
    handleCardSelection,
    checkPatterns,
};
