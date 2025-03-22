// Poker Game Logic

// Constantes
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const HAND_RANKINGS = {
    highCard: 1,
    pair: 2,
    twoPair: 3,
    threeOfAKind: 4,
    straight: 5,
    flush: 6,
    fullHouse: 7,
    fourOfAKind: 8,
    straightFlush: 9,
    royalFlush: 10
};

// Inicializar jogo de poker
function initPokerGame() {
    const pokerDecreaseBetBtn = document.getElementById('poker-decrease-bet');
    const pokerIncreaseBetBtn = document.getElementById('poker-increase-bet');
    const pokerCurrentBetDisplay = document.getElementById('poker-current-bet');
    const pokerDealBtn = document.getElementById('poker-deal');
    const pokerFoldBtn = document.getElementById('poker-fold');
    const pokerCheckBtn = document.getElementById('poker-check');
    const pokerCallBtn = document.getElementById('poker-call');
    const pokerRaiseBtn = document.getElementById('poker-raise');
    
    let pokerCurrentBet = 10;
    let gameState = 'idle'; // idle, deal, flop, turn, river, showdown
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let communityCards = [];
    let pot = 0;
    let dealerBet = 0;
    
    // Atualizar exibição da aposta
    function updatePokerBetDisplay() {
        pokerCurrentBetDisplay.textContent = `R$ ${pokerCurrentBet.toFixed(2)}`;
    }
    
    // Diminuir aposta
    pokerDecreaseBetBtn.addEventListener('click', () => {
        if (gameState !== 'idle') return;
        if (pokerCurrentBet > 5) {
            pokerCurrentBet -= 5;
            updatePokerBetDisplay();
        }
    });
    
    // Aumentar aposta
    pokerIncreaseBetBtn.addEventListener('click', () => {
        if (gameState !== 'idle') return;
        if (pokerCurrentBet < 100) {
            pokerCurrentBet += 5;
            updatePokerBetDisplay();
        }
    });
    
    // Criar baralho
    function createDeck() {
        const newDeck = [];
        for (const suit of SUITS) {
            for (const value of VALUES) {
                newDeck.push({ suit, value });
            }
        }
        return newDeck;
    }
    
    // Embaralhar baralho
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }
    
    // Distribuir cartas
    function dealCards() {
        // Verificar saldo
        if (currentUser.balance < pokerCurrentBet) {
            alert('Saldo insuficiente!');
            return;
        }
        
        // Deduzir aposta do saldo
        currentUser.balance -= pokerCurrentBet;
        updateUserInfo();
        updateUserInStorage();
        
        // Iniciar jogo
        gameState = 'deal';
        pot = pokerCurrentBet;
        
        // Criar e embaralhar baralho
        deck = shuffleDeck(createDeck());
        
        // Distribuir cartas para jogador e dealer
        playerCards = [deck.pop(), deck.pop()];
        dealerCards = [deck.pop(), deck.pop()];
        communityCards = [];
        
        // Atualizar interface
        updatePokerTable();
        
        // Habilitar/desabilitar botões
        pokerDealBtn.disabled = true;
        pokerFoldBtn.disabled = false;
        pokerCheckBtn.disabled = false;
        pokerCallBtn.disabled = false;
        pokerRaiseBtn.disabled = false;
        
        // Dealer faz aposta
        dealerBet = pokerCurrentBet;
        pot += dealerBet;
    }
    
    // Atualizar mesa de poker
    function updatePokerTable() {
        // Atualizar cartas do jogador
        const playerCardsContainer = document.querySelector('.player-cards');
        playerCardsContainer.innerHTML = '';
        
        playerCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            playerCardsContainer.appendChild(cardElement);
            
            // Adicionar animação de entrada
            setTimeout(() => {
                cardElement.classList.add('card-dealt');
                // Reproduzir som de distribuição
                const dealSound = new Audio('sounds/card-deal.mp3');
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 100);
        });
        
        // Atualizar cartas do dealer
        const dealerCardsContainer = document.querySelector('.dealer-cards');
        dealerCardsContainer.innerHTML = '';
        
        dealerCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            
            if (gameState === 'showdown' || index === 0) {
                cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            } else {
                cardElement.classList.add('card-back');
            }
            
            dealerCardsContainer.appendChild(cardElement);
            
            // Adicionar animação de entrada com atraso
            setTimeout(() => {
                cardElement.classList.add('card-dealt');
                // Reproduzir som de distribuição
                const dealSound = new Audio('sounds/card-deal.mp3');
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 300 + (index * 200));
        });
        
        // Atualizar cartas comunitárias
        const communityCardsContainer = document.querySelector('.community-cards');
        communityCardsContainer.innerHTML = '';
        
        // Adicionar cartas comunitárias existentes
        communityCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            communityCardsContainer.appendChild(cardElement);
            
            // Adicionar animação de entrada com atraso
            setTimeout(() => {
                cardElement.classList.add('card-dealt');
                // Reproduzir som de virar carta
                const flipSound = new Audio('sounds/card-flip.mp3');
                flipSound.volume = 0.3;
                flipSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 500 + (index * 200));
        });
        
        // Adicionar placeholders para cartas restantes
        const remainingCards = 5 - communityCards.length;
        for (let i = 0; i < remainingCards; i++) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card card-placeholder';
            communityCardsContainer.appendChild(cardElement);
        }
    }
    
    // Desistir
    function fold() {
        gameState = 'idle';
        alert('Você desistiu. O dealer venceu R$ ' + pot.toFixed(2));
        resetGame();
    }
    
    // Passar
    function check() {
        advanceGame();
    }
    
    // Pagar
    function call() {
        // Verificar saldo
        if (currentUser.balance < dealerBet) {
            alert('Saldo insuficiente!');
            return;
        }
        
        // Deduzir aposta do saldo
        currentUser.balance -= dealerBet;
        updateUserInfo();
        updateUserInStorage();
        
        pot += dealerBet;
        advanceGame();
    }
    
    // Aumentar
    function raise() {
        const raiseAmount = dealerBet * 2;
        
        // Verificar saldo
        if (currentUser.balance < raiseAmount) {
            alert('Saldo insuficiente!');
            return;
        }
        
        // Deduzir aposta do saldo
        currentUser.balance -= raiseAmount;
        updateUserInfo();
        updateUserInStorage();
        
        pot += raiseAmount;
        dealerBet = raiseAmount; // Dealer iguala o aumento
        pot += dealerBet;
        
        advanceGame();
    }
    
    // Avançar jogo
    function advanceGame() {
        switch (gameState) {
            case 'deal':
                // Flop (3 cartas comunitárias)
                gameState = 'flop';
                communityCards = [deck.pop(), deck.pop(), deck.pop()];
                break;
            case 'flop':
                // Turn (4ª carta comunitária)
                gameState = 'turn';
                communityCards.push(deck.pop());
                break;
            case 'turn':
                // River (5ª carta comunitária)
                gameState = 'river';
                communityCards.push(deck.pop());
                break;
            case 'river':
                // Showdown (comparar mãos)
                gameState = 'showdown';
                determineWinner();
                break;
        }
        
        updatePokerTable();
        
        if (gameState === 'showdown') {
            resetGame();
        }
    }
    
    // Determinar vencedor
    function determineWinner() {
        const playerHand = [...playerCards, ...communityCards];
        const dealerHand = [...dealerCards, ...communityCards];
        
        const playerHandRank = evaluateHand(playerHand);
        const dealerHandRank = evaluateHand(dealerHand);
        
        // Revelar a segunda carta do dealer
        const dealerCardsElements = document.querySelectorAll('.dealer-cards .card');
        if (dealerCardsElements.length > 1 && dealerCardsElements[1].classList.contains('card-back')) {
            dealerCardsElements[1].classList.remove('card-back');
            dealerCardsElements[1].innerHTML = `<div class="card-value">${dealerCards[1].value}</div><div class="card-suit ${dealerCards[1].suit === '♥' || dealerCards[1].suit === '♦' ? 'red' : 'black'}">${dealerCards[1].suit}</div>`;
            
            // Reproduzir som de virar carta
            const flipSound = new Audio('sounds/card-flip.mp3');
            flipSound.volume = 0.3;
            flipSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        }
        
        // Destacar as cartas que formam a melhor mão
        highlightBestHand(playerHandRank, playerHand, '.player-cards .card, .community-cards .card');
        
        // Mostrar resultado com atraso para dar tempo de ver as cartas
        setTimeout(() => {
            let resultMessage = '';
            
            if (playerHandRank.rank > dealerHandRank.rank) {
                // Jogador vence
                currentUser.balance += pot;
                updateUserInfo();
                updateUserInStorage();
                resultMessage = `Você venceu com ${getHandName(playerHandRank.rank)}! Ganhou R$ ${pot.toFixed(2)}`;
                
                // Reproduzir som de vitória
                const winSound = new Audio('sounds/poker-win.mp3');
                winSound.volume = 0.5;
                winSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                
                // Animação de vitória
                showPokerWinAnimation();
            } else if (dealerHandRank.rank > playerHandRank.rank) {
                // Dealer vence
                resultMessage = `Dealer venceu com ${getHandName(dealerHandRank.rank)}. Você perdeu R$ ${(pot / 2).toFixed(2)}`;
                
                // Reproduzir som de derrota
                const loseSound = new Audio('sounds/poker-lose.mp3');
                loseSound.volume = 0.4;
                loseSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            } else {
                // Empate, verificar desempate
                if (playerHandRank.highCard > dealerHandRank.highCard) {
                    // Jogador vence pelo desempate
                    currentUser.balance += pot;
                    updateUserInfo();
                    updateUserInStorage();
                    resultMessage = `Você venceu pelo desempate! Ganhou R$ ${pot.toFixed(2)}`;
                    
                    // Reproduzir som de vitória
                    const winSound = new Audio('sounds/poker-win.mp3');
                    winSound.volume = 0.5;
                    winSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                } else if (dealerHandRank.highCard > playerHandRank.highCard) {
                    // Dealer vence pelo desempate
                    resultMessage = `Dealer venceu pelo desempate. Você perdeu R$ ${(pot / 2).toFixed(2)}`;
                    
                    // Reproduzir som de derrota
                    const loseSound = new Audio('sounds/poker-lose.mp3');
                    loseSound.volume = 0.4;
                    loseSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                } else {
                    // Empate total
                    currentUser.balance += pot / 2;
                    updateUserInfo();
                    updateUserInStorage();
                    resultMessage = `Empate! Você recuperou R$ ${(pot / 2).toFixed(2)}`;
                }
            }
            
            // Mostrar resultado em um elemento na tela em vez de alert
            const pokerResultElement = document.createElement('div');
            pokerResultElement.className = 'poker-result';
            pokerResultElement.textContent = resultMessage;
            document.querySelector('.poker-table').appendChild(pokerResultElement);
            
            // Remover o resultado após alguns segundos
            setTimeout(() => {
                document.querySelector('.poker-result').remove();
            }, 5000);
        }, 1500);
    }
    
    // Destacar as cartas que formam a melhor mão
    function highlightBestHand(handRank, allCards, selector) {
        // Implementação simplificada - destaca todas as cartas do jogador
        const cards = document.querySelectorAll(selector);
        cards.forEach(card => {
            card.classList.add('highlight');
        });
    }
    
    // Animação de vitória no poker
    function showPokerWinAnimation() {
        const pokerTable = document.querySelector('.poker-table');
        pokerTable.classList.add('win-animation');
        
        // Criar chips animados caindo na mesa
        for (let i = 0; i < 20; i++) {
            const chip = document.createElement('div');
            chip.className = 'poker-chip';
            chip.style.left = `${Math.random() * 100}%`;
            chip.style.animationDelay = `${Math.random() * 1.5}s`;
            chip.style.backgroundColor = getRandomChipColor();
            pokerTable.appendChild(chip);
        }
        
        // Remover animação após alguns segundos
        setTimeout(() => {
            pokerTable.classList.remove('win-animation');
            const chips = document.querySelectorAll('.poker-chip');
            chips.forEach(chip => chip.remove());
        }, 4000);
    }
    
    // Gerar cor aleatória para os chips
    function getRandomChipColor() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Avaliar mão
    function evaluateHand(cards) {
        // Implementação simplificada para avaliação de mão
        // Retorna um objeto com o rank da mão e a carta mais alta para desempate
        
        // Contar ocorrências de cada valor
        const valueCounts = {};
        cards.forEach(card => {
            if (!valueCounts[card.value]) {
                valueCounts[card.value] = 1;
            } else {
                valueCounts[card.value]++;
            }
        });
        
        // Contar ocorrências de cada naipe
        const suitCounts = {};
        cards.forEach(card => {
            if (!suitCounts[card.suit]) {
                suitCounts[card.suit] = 1;
            } else {
                suitCounts[card.suit]++;
            }
        });
        
        // Verificar se há flush (5 cartas do mesmo naipe)
        const hasFlush = Object.values(suitCounts).some(count => count >= 5);
        
        // Verificar se há straight (5 cartas em sequência)
        const cardValues = cards.map(card => {
            if (card.value === 'A') return 14;
            if (card.value === 'K') return 13;
            if (card.value === 'Q') return 12;
            if (card.value === 'J') return 11;
            return parseInt(card.value);
        });
        
        const uniqueValues = [...new Set(cardValues)].sort((a, b) => a - b);
        let hasStraight = false;
        let straightHighCard = 0;
        
        for (let i = 0; i <= uniqueValues.length - 5; i++) {
            if (uniqueValues[i + 4] - uniqueValues[i] === 4) {
                hasStraight = true;
                straightHighCard = uniqueValues[i + 4];
            }
        }
        
        // Caso especial: A-2-3-4-5 (straight com Ás baixo)
        if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
            hasStraight = true;
            straightHighCard = 5; // Ás conta como 1 neste caso
        }
        
        // Verificar combinações
        const pairs = Object.entries(valueCounts).filter(([_, count]) => count === 2);
        const threeOfAKind = Object.entries(valueCounts).find(([_, count]) => count === 3);
        const fourOfAKind = Object.entries(valueCounts).find(([_, count]) => count === 4);
        
        // Determinar a mão
        if (hasFlush && hasStraight) {
            // Verificar royal flush (A-K-Q-J-10 do mesmo naipe)
            const isRoyal = straightHighCard === 14;
            return {
                rank: isRoyal ? HAND_RANKINGS.royalFlush : HAND_RANKINGS.straightFlush,
                highCard: straightHighCard
            };
        }
        
        if (fourOfAKind) {
            return {
                rank: HAND_RANKINGS.fourOfAKind,
                highCard: getCardValue(fourOfAKind[0])
            };
        }
        
        if (threeOfAKind && pairs.length > 0) {
            return {
                rank: HAND_RANKINGS.fullHouse,
                highCard: getCardValue(threeOfAKind[0])
            };
        }
        
        if (hasFlush) {
            const flushCards = [];
            const flushSuit = Object.entries(suitCounts).find(([_, count]) => count >= 5)[0];
            cards.forEach(card => {
                if (card.suit === flushSuit) {
                    flushCards.push(getCardValue(card.value));
                }
            });
            return {
                rank: HAND_RANKINGS.flush,
                highCard: Math.max(...flushCards)
            };
        }
        
        if (hasStraight) {
            return {
                rank: HAND_RANKINGS.straight,
                highCard: straightHighCard
            };
        }
        
        if (threeOfAKind) {
            return {
                rank: HAND_RANKINGS.threeOfAKind,
                highCard: getCardValue(threeOfAKind[0])
            };
        }
        
        if (pairs.length >= 2) {
            const pairValues = pairs.map(pair => getCardValue(pair[0])).sort((a, b) => b - a);
            return {
                rank: HAND_RANKINGS.twoPair,
                highCard: pairValues[0]
            };
        }
        
        if (pairs.length === 1) {
            return {
                rank: HAND_RANKINGS.pair,
                highCard: getCardValue(pairs[0][0])
            };
        }
        
        // High card
        return {
            rank: HAND_RANKINGS.highCard,
            highCard: Math.max(...cardValues)
        };
    }
    
    // Obter valor numérico da carta
    function getCardValue(value) {
        if (value === 'A') return 14;
        if (value === 'K') return 13;
        if (value === 'Q') return 12;
        if (value === 'J') return 11;
        return parseInt(value);
    }
    
    // Obter nome da mão
    function getHandName(rank) {
        switch (rank) {
            case HAND_RANKINGS.royalFlush: return 'Royal Flush';
            case HAND_RANKINGS.straightFlush: return 'Straight Flush';
            case HAND_RANKINGS.fourOfAKind: return 'Quadra';
            case HAND_RANKINGS.fullHouse: return 'Full House';
            case HAND_RANKINGS.flush: return 'Flush';
            case HAND_RANKINGS.straight: return 'Sequência';
            case HAND_RANKINGS.threeOfAKind: return 'Trinca';
            case HAND_RANKINGS.twoPair: return 'Dois Pares';
            case HAND_RANKINGS.pair: return 'Par';
            default: return 'Carta Alta';
        }
    }
    
    // Resetar jogo
    function resetGame() {
        gameState = 'idle';
        pokerDealBtn.disabled = false;
        pokerFoldBtn.disabled = true;
        pokerCheckBtn.disabled = true;
        pokerCallBtn.disabled = true;
        pokerRaiseBtn.disabled = true;
    }
    
    // Adicionar event listeners
    pokerDealBtn.addEventListener('click', dealCards);
    pokerFoldBtn.addEventListener('click', fold);
    pokerCheckBtn.addEventListener('click', check);
    pokerCallBtn.addEventListener('click', call);
    pokerRaiseBtn.addEventListener('click', raise);
    
    // Inicializar botões
    resetGame();
    updatePokerBetDisplay();
}