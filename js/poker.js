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
    let bot1Cards = [];
    let bot2Cards = [];
    let communityCards = [];
    let pot = 0;
    let dealerBet = 0;
    let bot1Bet = 0;
    let bot2Bet = 0;
    let activePlayers = []; // Jogadores ativos na rodada atual
    
    // Verificar se é a primeira vez que o jogador acessa o poker
    const hasPlayedPoker = localStorage.getItem('hasPlayedPoker');
    if (!hasPlayedPoker) {
        showFirstTimeMessage();
        localStorage.setItem('hasPlayedPoker', 'true');
    }
    
    // Função para mostrar mensagem de primeira vez
    function showFirstTimeMessage() {
        const messageContainer = document.createElement('div');
        messageContainer.className = 'poker-tutorial';
        messageContainer.style.position = 'absolute';
        messageContainer.style.top = '50%';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translate(-50%, -50%)';
        messageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        messageContainer.style.color = 'white';
        messageContainer.style.padding = '20px';
        messageContainer.style.borderRadius = '10px';
        messageContainer.style.maxWidth = '400px';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        
        messageContainer.innerHTML = `
            <h3 style="color: #e74c3c; margin-top: 0;">Bem-vindo ao Poker!</h3>
            <p>Aqui estão algumas regras básicas:</p>
            <ul style="text-align: left; padding-left: 20px;">
                <li>Você começa com duas cartas privadas</li>
                <li>Cinco cartas comunitárias serão reveladas em etapas</li>
                <li>Você pode Desistir, Passar, Pagar ou Aumentar a aposta</li>
                <li>O objetivo é formar a melhor mão de cinco cartas</li>
            </ul>
            <p>Clique em "Começar a Jogar" para iniciar sua primeira partida!</p>
            <button id="start-poker-btn" style="background-color: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px;">Começar a Jogar</button>
        `;
        
        document.querySelector('.poker-table').appendChild(messageContainer);
        
        // Adicionar evento ao botão de começar
        document.getElementById('start-poker-btn').addEventListener('click', () => {
            messageContainer.remove();
        });
    }
    
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
    
    // Distribuir cartas
    pokerDealBtn.addEventListener('click', dealCards);
    
    // Desistir
    pokerFoldBtn.addEventListener('click', fold);
    
    // Passar
    pokerCheckBtn.addEventListener('click', check);
    
    // Pagar
    pokerCallBtn.addEventListener('click', call);
    
    // Aumentar
    pokerRaiseBtn.addEventListener('click', raise);
    
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
    
    // Embaralhar baralho com viés para favorecer os bots
    function shuffleDeck(deck) {
        // Embaralhar normalmente primeiro
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // Agora vamos manipular o baralho para dar melhores cartas aos bots
        // Isso é feito de forma sutil para não ser óbvio ao jogador
        
        // Separar cartas de alto valor (10, J, Q, K, A)
        const highValueCards = deck.filter(card => 
            card.value === '10' || card.value === 'J' || 
            card.value === 'Q' || card.value === 'K' || 
            card.value === 'A'
        );
        
        // Separar pares potenciais (cartas com mesmo valor)
        const valueGroups = {};
        deck.forEach(card => {
            if (!valueGroups[card.value]) {
                valueGroups[card.value] = [];
            }
            valueGroups[card.value].push(card);
        });
        
        // Encontrar pares (grupos com pelo menos 2 cartas do mesmo valor)
        const pairs = Object.values(valueGroups).filter(group => group.length >= 2);
        
        // 70% de chance de manipular o baralho para favorecer os bots
        if (Math.random() < 0.7) {
            // Remover o baralho atual
            deck.length = 0;
            
            // Adicionar cartas para os bots primeiro (6 cartas para 3 bots)
            // Priorizar dar pares ou cartas altas para os bots
            let botCards = [];
            
            // Tentar dar pares para os bots (se houver)
            if (pairs.length > 0 && Math.random() < 0.6) {
                // Selecionar pares aleatórios para os bots
                const randomPairs = [...pairs].sort(() => Math.random() - 0.5).slice(0, 2);
                randomPairs.forEach(pair => {
                    // Adicionar até 2 cartas de cada par
                    botCards.push(...pair.slice(0, 2));
                });
            }
            
            // Completar com cartas altas se necessário
            while (botCards.length < 6 && highValueCards.length > 0) {
                const randomIndex = Math.floor(Math.random() * highValueCards.length);
                const card = highValueCards.splice(randomIndex, 1)[0];
                if (!botCards.includes(card)) {
                    botCards.push(card);
                }
            }
            
            // Adicionar as cartas dos bots ao início do baralho (serão distribuídas primeiro)
            deck.push(...botCards);
            
            // Adicionar as cartas restantes
            const remainingCards = deck.length === 0 ? 
                [...highValueCards] : 
                [...highValueCards.filter(card => !botCards.includes(card))];
                
            // Adicionar todas as outras cartas que não foram selecionadas
            deck.forEach(card => {
                if (!botCards.includes(card) && !remainingCards.includes(card)) {
                    remainingCards.push(card);
                }
            });
            
            // Embaralhar as cartas restantes
            for (let i = remainingCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remainingCards[i], remainingCards[j]] = [remainingCards[j], remainingCards[i]];
            }
            
            // Adicionar as cartas restantes ao baralho
            deck.push(...remainingCards);
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
        
        // Definir jogadores ativos
        activePlayers = ['player', 'bot1', 'bot2', 'dealer'];
        
        // Distribuir cartas para todos os jogadores
        playerCards = [deck.pop(), deck.pop()];
        bot1Cards = [deck.pop(), deck.pop()];
        bot2Cards = [deck.pop(), deck.pop()];
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
        
        // Todos fazem apostas iniciais
        dealerBet = pokerCurrentBet;
        bot1Bet = pokerCurrentBet;
        bot2Bet = pokerCurrentBet;
        pot += dealerBet + bot1Bet + bot2Bet;
        
        // Simular decisões dos bots com um pequeno atraso
        setTimeout(() => {
            botDecisions();
        }, 1000);
        
        // Reproduzir som de distribuição de cartas
        const dealSound = new Audio('sounds/card-deal.mp3');
        dealSound.volume = 0.3;
        dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
    }
    
    // Atualizar mesa de poker
    function updatePokerTable() {
        // Remover destaque de todos os jogadores
        document.querySelectorAll('.player-cards, .bot-cards, .dealer-cards').forEach(el => el.style.border = '');

        // Destacar o jogador ativo
        if (activePlayers.includes('player')) {
            document.querySelector('.player-cards').style.border = '3px solid #00ff00';
        } else if (activePlayers.includes('bot1')) {
            document.querySelector('.bot-left .bot-cards').style.border = '3px solid #ff0000';
        } else if (activePlayers.includes('bot2')) {
            document.querySelector('.bot-right .bot-cards').style.border = '3px solid #0000ff';
        } else if (activePlayers.includes('dealer')) {
            document.querySelector('.dealer-cards').style.border = '3px solid #ffff00';
        }

        // Atualizar cartas do jogador
        const playerCardsContainer = document.querySelector('.player-cards');
        playerCardsContainer.innerHTML = '';
        
        playerCards.forEach((card, index) => {
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
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 600 + (index * 200));
        });
        
        // Atualizar cartas comunitárias
        const communityCardsContainer = document.querySelector('.community-cards');
        communityCardsContainer.innerHTML = '';
        
        // Mostrar cartas comunitárias
        communityCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            communityCardsContainer.appendChild(cardElement);
            
            // Adicionar animação de entrada com atraso
            setTimeout(() => {
                cardElement.classList.add('card-dealt');
                // Reproduzir som de distribuição
                const dealSound = new Audio('sounds/card-deal.mp3');
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 1000 + (index * 200));
        });
        
        // Adicionar placeholders para cartas restantes
        const remainingCards = 5 - communityCards.length;
        for (let i = 0; i < remainingCards; i++) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card card-placeholder';
            communityCardsContainer.appendChild(cardElement);
        }
        
        // Atualizar cartas do Bot 1
        const bot1CardsContainer = document.querySelector('.bot-left .bot-cards');
        bot1CardsContainer.innerHTML = '';
        
        bot1Cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            
            if (gameState === 'showdown') {
                cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            } else {
                cardElement.classList.add('card-back');
            }
            
            bot1CardsContainer.appendChild(cardElement);
            
            // Adicionar animação de entrada com atraso
            setTimeout(() => {
                cardElement.classList.add('card-dealt');
                // Reproduzir som de distribuição
                const dealSound = new Audio('sounds/card-deal.mp3');
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 600 + (index * 200));
        });
        

   
        
        // Atualizar cartas do Bot 2
        const bot2CardsContainer = document.querySelector('.bot-right .bot-cards');
        bot2CardsContainer.innerHTML = '';
        
        bot2Cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            
            if (gameState === 'showdown') {
                cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            } else {
                cardElement.classList.add('card-back');
            }
            
            bot2CardsContainer.appendChild(cardElement);
            
            // Adicionar animação de entrada com atraso
            setTimeout(() => {
                cardElement.classList.add('card-dealt');
                // Reproduzir som de distribuição
                const dealSound = new Audio('sounds/card-deal.mp3');
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                dealSound.volume = 0.3;
                dealSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            }, 600 + (index * 200));
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
            }, 600 + (index * 200));
        });
    }
    
    // Função para simular decisões dos bots
    function botDecisions() {
        if (!activePlayers.includes('bot1') && !activePlayers.includes('bot2')) {
            // Se ambos os bots desistiram e o jogador ainda está ativo, o jogador vence automaticamente
            if (activePlayers.includes('player') && activePlayers.length === 2) { // player + dealer = 2
                playerWinsAutomatically();
                return;
            }
            return; // Se nenhum bot estiver ativo, não faz nada
        }
        
        // Simular decisões com base no estado do jogo e nas cartas
        if (activePlayers.includes('bot1')) {
            const bot1Decision = getBotDecision(bot1Cards, communityCards, 1); // Bot 1 (conservador)
            const bot1InfoElement = document.querySelector('.bot-left .bot-info');
            
            // Mostrar decisão do bot
            setTimeout(() => {
                switch (bot1Decision) {
                    case 'fold':
                        bot1InfoElement.textContent = 'Bot 1 (Desistiu)';
                        activePlayers = activePlayers.filter(p => p !== 'bot1');
                        break;
                    case 'check':
                        bot1InfoElement.textContent = 'Bot 1 (Passou)';
                        break;
                    case 'call':
                        bot1InfoElement.textContent = 'Bot 1 (Pagou)';
                        pot += dealerBet;
                        // Animação de fichas
                        showChipAnimation('bot1', dealerBet);
                        break;
                    case 'raise':
                        const raiseAmount = dealerBet * 1.5;
                        bot1InfoElement.textContent = `Bot 1 (Aumentou: R$${raiseAmount.toFixed(2)})`;
                        pot += raiseAmount;
                        // Animação de fichas
                        showChipAnimation('bot1', raiseAmount);
                        dealerBet = raiseAmount; // Dealer iguala o aumento
                        pot += dealerBet;
                        break;
                }
                
                // Reproduzir som de decisão
                const decisionSound = new Audio('sounds/card-flip.mp3');
                decisionSound.volume = 0.2;
                decisionSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                
                // Adicionar expressão facial ao bot baseada na decisão
                showBotExpression('bot1', bot1Decision, evaluateHand([...bot1Cards, ...communityCards]).rank);
            }, 1000);
        }
        
        if (activePlayers.includes('bot2')) {
            const bot2Decision = getBotDecision(bot2Cards, communityCards, 2); // Bot 2 (agressivo)
            const bot2InfoElement = document.querySelector('.bot-right .bot-info');
            
            // Mostrar decisão do bot com atraso para não ser simultâneo
            setTimeout(() => {
                switch (bot2Decision) {
                    case 'fold':
                        bot2InfoElement.textContent = 'Bot 2 (Desistiu)';
                        activePlayers = activePlayers.filter(p => p !== 'bot2');
                        break;
                    case 'check':
                        bot2InfoElement.textContent = 'Bot 2 (Passou)';
                        break;
                    case 'call':
                        bot2InfoElement.textContent = 'Bot 2 (Pagou)';
                        pot += dealerBet;
                        // Animação de fichas
                        showChipAnimation('bot2', dealerBet);
                        break;
                    case 'raise':
                        const raiseAmount = dealerBet * 1.5;
                        bot2InfoElement.textContent = `Bot 2 (Aumentou: R$${raiseAmount.toFixed(2)})`;
                        pot += raiseAmount;
                        // Animação de fichas
                        showChipAnimation('bot2', raiseAmount);
                        dealerBet = raiseAmount; // Dealer iguala o aumento
                        pot += dealerBet;
                        break;
                }
                
                // Reproduzir som de decisão
                const decisionSound = new Audio('sounds/card-flip.mp3');
                decisionSound.volume = 0.2;
                decisionSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                
                // Adicionar expressão facial ao bot baseada na decisão
                showBotExpression('bot2', bot2Decision, evaluateHand([...bot2Cards, ...communityCards]).rank);
            }, 2000);
        }
    }
    
    // Função para mostrar expressão facial do bot
    function showBotExpression(bot, decision, handRank) {
        const botElement = document.querySelector(bot === 'bot1' ? '.bot-left' : '.bot-right');
        const expressionElement = document.createElement('div');
        expressionElement.className = 'bot-expression';
        
        // Determinar expressão baseada na decisão e força da mão
        let expression = '';
        
        if (decision === 'fold') {
            expression = '😔'; // Triste ao desistir
        } else if (decision === 'check') {
            expression = '😐'; // Neutro ao passar
        } else if (decision === 'call') {
            expression = '🤔'; // Pensativo ao pagar
        } else if (decision === 'raise') {
            // Se tiver mão forte e aumentar = confiante
            // Se tiver mão fraca e aumentar = blefando
            expression = handRank >= HAND_RANKINGS.threeOfAKind ? '😎' : '😏';
        }
        
        expressionElement.textContent = expression;
        botElement.appendChild(expressionElement);
        
        // Remover expressão após alguns segundos
        setTimeout(() => {
            expressionElement.remove();
        }, 2000);
    }
    
    // Função para verificar potencial flush
    function checkPotentialFlush(playerCards, communityCards) {
        // Contar naipes
        const suitCounts = {};
        
        // Contar naipes nas cartas do jogador
        playerCards.forEach(card => {
            if (!suitCounts[card.suit]) {
                suitCounts[card.suit] = 1;
            } else {
                suitCounts[card.suit]++;
            }
        });
        
        // Contar naipes nas cartas comunitárias
        communityCards.forEach(card => {
            if (!suitCounts[card.suit]) {
                suitCounts[card.suit] = 1;
            } else {
                suitCounts[card.suit]++;
            }
        });
        
        // Verificar se há pelo menos 4 cartas do mesmo naipe (potencial para flush)
        return Object.values(suitCounts).some(count => count >= 4);
    }
    
    // Função para verificar potencial straight
    function checkPotentialStraight(playerCards, communityCards) {
        // Combinar cartas e converter valores para números
        const allCards = [...playerCards, ...communityCards];
        const cardValues = allCards.map(card => {
            if (card.value === 'A') return 14;
            if (card.value === 'K') return 13;
            if (card.value === 'Q') return 12;
            if (card.value === 'J') return 11;
            return parseInt(card.value);
        });
        
        // Ordenar valores e remover duplicatas
        const uniqueValues = [...new Set(cardValues)].sort((a, b) => a - b);
        
        // Verificar se há pelo menos 4 valores consecutivos
        for (let i = 0; i < uniqueValues.length - 3; i++) {
            if (uniqueValues[i + 3] - uniqueValues[i] === 3) {
                return true;
            }
        }
        
        // Caso especial: A-2-3-4 (potencial para A-2-3-4-5)
        if (uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4)) {
            return true;
        }
        
        return false;
    }
    
    // Função para o jogador ganhar automaticamente quando ambos os bots desistirem
    function playerWinsAutomatically() {
        // Verificar se o jogador ainda está ativo
        if (!activePlayers.includes('player')) return;
        
        // Jogador vence automaticamente
        const winAmount = pot;
        currentUser.balance += winAmount;
        updateUserInfo();
        updateUserInStorage();
        
        // Exibir resultado
        const pokerResult = document.createElement('div');
        pokerResult.className = 'poker-result';
        pokerResult.textContent = `Você venceu R$ ${winAmount.toFixed(2)} automaticamente! Todos os bots desistiram.`;
        document.querySelector('.poker-table').appendChild(pokerResult);
        
        // Reproduzir som de vitória
        const winSound = new Audio('sounds/poker-win.mp3');
        winSound.volume = 0.4;
        winSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        
        // Mostrar animação de vitória
        showPokerWinAnimation();
        
        // Remover resultado após alguns segundos
        setTimeout(() => {
            pokerResult.remove();
            resetGame();
        }, 5000);
    }
    
    // Função para determinar a decisão do bot com base nas cartas
    function getBotDecision(botCards, communityCards, botIndex) {
        // Avaliar a mão atual do bot
        const botHand = [...botCards, ...communityCards];
        const handRank = evaluateHand(botHand);
        
        // Definir perfil do bot (bot1 é mais conservador, bot2 é mais agressivo)
        const botProfile = botIndex === 1 ? 'conservador' : 'agressivo';
        
        // Decisão baseada na força da mão, estágio do jogo e perfil do bot
        const randomFactor = Math.random();
        
        // Considerar o estágio do jogo
        const gameStage = communityCards.length === 0 ? 'preflop' : 
                         communityCards.length === 3 ? 'flop' : 
                         communityCards.length === 4 ? 'turn' : 'river';
        
        // Analisar cartas comunitárias para possíveis combinações
        const potentialFlush = checkPotentialFlush(botCards, communityCards);
        const potentialStraight = checkPotentialStraight(botCards, communityCards);
        const hasPotential = potentialFlush || potentialStraight;
        
        // Considerar o tamanho do pote em relação à aposta
        const potRatio = pot / dealerBet;
        const goodPotOdds = potRatio > 3; // Boas odds se o pote for pelo menos 3x a aposta
        
        // Mãos fortes (trinca ou melhor)
        if (handRank.rank >= HAND_RANKINGS.threeOfAKind) {
            // Com mão forte, ser extremamente agressivo, especialmente no final do jogo
            if (gameStage === 'river' || gameStage === 'turn') {
                // No final do jogo, ser ainda mais agressivo com mãos fortes
                if (botProfile === 'agressivo') {
                    return randomFactor < 0.98 ? 'raise' : 'call'; // Aumentado para 98% de chance de aumentar
                } else {
                    return randomFactor < 0.90 ? 'raise' : 'call'; // Aumentado para 90% de chance de aumentar
                }
            } else {
                // No início, ainda ser muito agressivo
                if (botProfile === 'agressivo') {
                    return randomFactor < 0.95 ? 'raise' : 'call'; // Aumentado para 95% de chance de aumentar
                } else {
                    return randomFactor < 0.85 ? 'raise' : 'call'; // Aumentado para 85% de chance de aumentar
                }
            }
        }
        
        // Mãos médias (par ou dois pares)
        if (handRank.rank >= HAND_RANKINGS.pair) {
            // Verificar se é um par alto (10 ou maior)
            const isPairHigh = handRank.highCard >= 10;
            
            // Com par, comportamento varia conforme o estágio do jogo e força do par
            if (gameStage === 'preflop') {
                if (isPairHigh) {
                    // Par alto no preflop - menos chance de desistir
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.05) return 'fold'; // Reduzido de 0.1 para 0.05
                        if (randomFactor < 0.5) return 'call';  // Reduzido de 0.6 para 0.5
                        return 'raise'; // Mais chance de aumentar
                    } else {
                        if (randomFactor < 0.1) return 'fold';  // Reduzido de 0.2 para 0.1
                        if (randomFactor < 0.7) return 'call';  // Reduzido de 0.8 para 0.7
                        return 'raise'; // Mais chance de aumentar
                    }
                } else {
                    // Par baixo no preflop - mais estratégico
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.2) return 'fold';  // Reduzido de 0.3 para 0.2
                        if (randomFactor < 0.6) return 'call';  // Reduzido de 0.7 para 0.6
                        return 'raise'; // Mais chance de aumentar
                    } else {
                        if (randomFactor < 0.3) return 'fold';  // Reduzido de 0.4 para 0.3
                        if (randomFactor < 0.8) return 'call';  // Reduzido de 0.9 para 0.8
                        return randomFactor < 0.9 ? 'check' : 'raise'; // Chance de aumentar
                    }
                }
            } else if (gameStage === 'river') {
                // No river, avaliar melhor a força da mão
                if (handRank.rank >= HAND_RANKINGS.twoPair) {
                    // Com dois pares ou melhor no river
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.05) return 'fold';
                        if (randomFactor < 0.4) return 'call';
                        return 'raise';
                    } else {
                        if (randomFactor < 0.1) return 'fold';
                        if (randomFactor < 0.7) return 'call';
                        return 'raise';
                    }
                } else {
                    // Com apenas um par no river
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.3) return 'fold';
                        if (randomFactor < 0.8) return 'call';
                        return 'check';
                    } else {
                        if (randomFactor < 0.5) return 'fold';
                        if (randomFactor < 0.9) return 'call';
                        return 'check';
                    }
                }
            } else {
                // Nos outros estágios (flop e turn)
                if (handRank.rank >= HAND_RANKINGS.twoPair) {
                    // Com dois pares ou melhor no flop/turn
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.1) return 'fold';
                        if (randomFactor < 0.5) return 'call';
                        return 'raise';
                    } else {
                        if (randomFactor < 0.2) return 'fold';
                        if (randomFactor < 0.7) return 'call';
                        return 'raise';
                    }
                } else {
                    // Com apenas um par no flop/turn
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.2) return 'fold';
                        if (randomFactor < 0.7) return 'call';
                        return 'check';
                    } else {
                        if (randomFactor < 0.3) return 'fold';
                        if (randomFactor < 0.8) return 'call';
                        return 'check';
                    }
                }
            }
        }
        
        // Mãos fracas (carta alta)
        // Considerar potencial para straight ou flush
        if (hasPotential) {
            // Com potencial para straight ou flush
            if (gameStage === 'preflop') {
                // No preflop, mais chances de continuar com potencial
                if (botProfile === 'agressivo') {
                    if (randomFactor < 0.3) return 'fold';
                    if (randomFactor < 0.7) return 'call';
                    return randomFactor < 0.9 ? 'check' : 'raise'; // Blefe ocasional
                } else {
                    if (randomFactor < 0.4) return 'fold';
                    if (randomFactor < 0.9) return 'call';
                    return 'check';
                }
            } else if (gameStage === 'river') {
                // No river, sem mais cartas para completar a mão
                if (botProfile === 'agressivo') {
                    if (randomFactor < 0.7) return 'fold';
                    if (randomFactor < 0.9) return 'check';
                    return 'call'; // Blefe raro
                } else {
                    if (randomFactor < 0.8) return 'fold';
                    return 'check';
                }
            } else {
                // No flop/turn, ainda há chances de completar a mão
                if (goodPotOdds) {
                    // Boas odds do pote justificam continuar
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.3) return 'fold';
                        if (randomFactor < 0.8) return 'call';
                        return randomFactor < 0.9 ? 'check' : 'raise';
                    } else {
                        if (randomFactor < 0.4) return 'fold';
                        if (randomFactor < 0.9) return 'call';
                        return 'check';
                    }
                } else {
                    // Odds ruins, melhor desistir na maioria das vezes
                    if (botProfile === 'agressivo') {
                        if (randomFactor < 0.6) return 'fold';
                        if (randomFactor < 0.9) return 'check';
                        return 'call';
                    } else {
                        if (randomFactor < 0.7) return 'fold';
                        return 'check';
                    }
                }
            }
        } else {
            // Sem potencial para melhorar
            if (gameStage === 'preflop') {
                // No preflop, mais chances de blefar
                if (botProfile === 'agressivo') {
                    if (randomFactor < 0.5) return 'fold';
                    if (randomFactor < 0.8) return 'check';
                    return randomFactor < 0.95 ? 'call' : 'raise'; // Blefe ocasional
                } else {
                    if (randomFactor < 0.7) return 'fold';
                    return 'check';
                }
            } else if (gameStage === 'river') {
                // No river, mais conservador com mãos fracas
                if (botProfile === 'agressivo') {
                    if (randomFactor < 0.8) return 'fold';
                    if (randomFactor < 0.95) return 'check';
                    return 'call'; // Blefe raro
                } else {
                    if (randomFactor < 0.9) return 'fold';
                    return 'check';
                }
            } else {
                // Nos outros estágios
                if (botProfile === 'agressivo') {
                    if (randomFactor < 0.6) return 'fold';
                    if (randomFactor < 0.9) return 'check';
                    return 'call'; // Blefe ocasional
                } else {
                    if (randomFactor < 0.8) return 'fold';
                    return 'check';
                }
            }
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
        
        // Atualizar informações na interface
        const playerInfoElement = document.querySelector('.player-info');
        playerInfoElement.textContent = 'Você (Pagou)';
        
        // Animação de fichas sendo movidas para o pote
        showChipAnimation('player', dealerBet);
        
        // Reproduzir som de fichas
        const chipSound = new Audio('sounds/chip-sound.mp3');
        chipSound.volume = 0.3;
        chipSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        
        // Avançar o jogo após a ação do jogador
        setTimeout(() => {
            advanceGame();
        }, 1000); // Pequeno atraso para a animação ser visível
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
        
        // Atualizar informações na interface
        const playerInfoElement = document.querySelector('.player-info');
        playerInfoElement.textContent = `Você (Aumentou: R$${raiseAmount.toFixed(2)})`;
        
        // Animação de fichas sendo movidas para o pote
        showChipAnimation('player', raiseAmount);
        
        // Reproduzir som de fichas
        const chipSound = new Audio('sounds/chip-sound.mp3');
        chipSound.volume = 0.3;
        chipSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        
        // Dealer iguala o aumento após um pequeno atraso
        setTimeout(() => {
            dealerBet = raiseAmount;
            pot += dealerBet;
            showChipAnimation('dealer', dealerBet);
            advanceGame();
        }, 1500);
    }
    
    // Função para mostrar animação de fichas
    function showChipAnimation(player, amount) {
        const pokerTable = document.querySelector('.poker-table');
        const numChips = Math.min(Math.ceil(amount / 5), 10); // Número de fichas baseado no valor
        
        // Definir posição inicial baseada no jogador
        let startX, startY;
        switch(player) {
            case 'player':
                startX = '50%';
                startY = '90%';
                break;
            case 'dealer':
                startX = '50%';
                startY = '10%';
                break;
            case 'bot1':
                startX = '10%';
                startY = '50%';
                break;
            case 'bot2':
                startX = '90%';
                startY = '50%';
                break;
        }
        
        // Criar e animar fichas
        for (let i = 0; i < numChips; i++) {
            const chip = document.createElement('div');
            chip.className = 'bet-chip';
            chip.style.left = startX;
            chip.style.top = startY;
            chip.style.backgroundColor = getRandomChipColor();
            chip.style.animationDelay = `${i * 0.1}s`;
            pokerTable.appendChild(chip);
            
            // Remover chip após a animação
            setTimeout(() => {
                chip.remove();
            }, 1000);
        }
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
        
        // Simular decisões dos bots com um pequeno atraso
        if (gameState !== 'showdown') {
            setTimeout(() => {
                botDecisions();
            }, 1000);
        }
        
        if (gameState === 'showdown') {
            resetGame();
        }
    }
    
    // Determinar vencedor
    function determineWinner() {
        // Coletar mãos de todos os jogadores ativos
        const hands = {};
        
        if (activePlayers.includes('player')) {
            hands.player = {
                cards: [...playerCards, ...communityCards],
                rank: evaluateHand([...playerCards, ...communityCards])
            };
        }
        
        // Função para dar uma vantagem aos bots (sem que o jogador perceba)
        function applyBotAdvantage(handRank, botType) {
            // Chance aumentada de aplicar vantagem para os bots
            // 70% para o bot1 (conservador)
            // 80% para o bot2 (agressivo)
            // 75% para o dealer
            const chanceToBoost = botType === 'bot1' ? 0.70 : 
                                 botType === 'bot2' ? 0.80 : 0.75;
            
            // Aplicar vantagem apenas em algumas situações para não ser óbvio
            if (Math.random() < chanceToBoost) {
                // Se a mão já for muito forte, não aplicar vantagem (para não ser óbvio)
                if (handRank.rank >= HAND_RANKINGS.fourOfAKind) {
                    return handRank; // Manter como está apenas para mãos extremamente fortes
                }
                
                // Boost na classificação da mão
                // Aumentar em até 3 níveis para dar uma vantagem ainda mais significativa
                // 50% chance de +1, 30% chance de +2, 20% chance de +3
                const randomBoost = Math.random();
                const boostLevel = randomBoost < 0.5 ? 1 : (randomBoost < 0.8 ? 2 : 3);
                
                const boostedRank = {
                    rank: Math.min(handRank.rank + boostLevel, HAND_RANKINGS.fourOfAKind),
                    highCard: handRank.highCard
                };
                
                // Se for apenas um aumento de carta alta para par ou melhor, aumentar a carta alta também
                if (handRank.rank <= HAND_RANKINGS.twoPair && boostedRank.rank > handRank.rank) {
                    // Aumentar a carta alta em 1-3 pontos
                    const highCardBoost = Math.floor(Math.random() * 3) + 1;
                    boostedRank.highCard = Math.min(handRank.highCard + highCardBoost, 14); // Máximo é Ás (14)
                }
                
                return boostedRank;
            }
            
            return handRank; // Sem alteração
        }
        
        if (activePlayers.includes('bot1')) {
            const originalRank = evaluateHand([...bot1Cards, ...communityCards]);
            hands.bot1 = {
                cards: [...bot1Cards, ...communityCards],
                rank: applyBotAdvantage(originalRank, 'bot1')
            };
        }
        
        if (activePlayers.includes('bot2')) {
            const originalRank = evaluateHand([...bot2Cards, ...communityCards]);
            hands.bot2 = {
                cards: [...bot2Cards, ...communityCards],
                rank: applyBotAdvantage(originalRank, 'bot2')
            };
        }
        
        if (activePlayers.includes('dealer')) {
            const originalRank = evaluateHand([...dealerCards, ...communityCards]);
            hands.dealer = {
                cards: [...dealerCards, ...communityCards],
                rank: applyBotAdvantage(originalRank, 'dealer')
            };
        }
        
        // Encontrar o vencedor
        let winner = null;
        let winnerRank = 0;
        let winnerHighCard = 0;
        
        for (const [player, hand] of Object.entries(hands)) {
            if (hand.rank.rank > winnerRank || 
                (hand.rank.rank === winnerRank && hand.rank.highCard > winnerHighCard)) {
                winner = player;
                winnerRank = hand.rank.rank;
                winnerHighCard = hand.rank.highCard;
            }
        }
        
        // Exibir resultado
        const pokerResult = document.createElement('div');
        pokerResult.className = 'poker-result';
        
        if (winner === 'player') {
            // Jogador venceu
            const winAmount = pot;
            currentUser.balance += winAmount;
            updateUserInfo();
            updateUserInStorage();
            
            pokerResult.textContent = `Você venceu R$ ${winAmount.toFixed(2)} com ${getHandName(winnerRank)}!`;
            showPokerWinAnimation();
            
            // Reproduzir som de vitória
            const winSound = new Audio('sounds/poker-win.mp3');
            winSound.volume = 0.4;
            winSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        } else {
            // Jogador perdeu
            const loserName = winner === 'dealer' ? 'Dealer' : winner === 'bot1' ? 'Bot 1' : 'Bot 2';
            pokerResult.textContent = `${loserName} venceu com ${getHandName(winnerRank)}!`;
            
            // Reproduzir som de derrota
            const loseSound = new Audio('sounds/poker-lose.mp3');
            loseSound.volume = 0.3;
            loseSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        }
        
        document.querySelector('.poker-table').appendChild(pokerResult);
        
        // Remover resultado após alguns segundos
        setTimeout(() => {
            pokerResult.remove();
        }, 5000);
        
        // Destacar cartas da mão vencedora
        if (winner === 'player') {
            highlightBestHand(hands.player.rank, hands.player.cards, '.player-cards .card');
        } else if (winner === 'dealer') {
            highlightBestHand(hands.dealer.rank, hands.dealer.cards, '.dealer-cards .card');
        } else if (winner === 'bot1') {
            highlightBestHand(hands.bot1.rank, hands.bot1.cards, '.bot-left .bot-cards .card');
        } else if (winner === 'bot2') {
            highlightBestHand(hands.bot2.rank, hands.bot2.cards, '.bot-right .bot-cards .card');
        }
        
        // Revelar todas as cartas
        // Revelar cartas do dealer
        const dealerCardsElements = document.querySelectorAll('.dealer-cards .card');
        dealerCardsElements.forEach((cardElement, index) => {
            if (cardElement.classList.contains('card-back')) {
                cardElement.classList.remove('card-back');
                const card = dealerCards[index];
                cardElement.innerHTML = `<div class="card-value">${card.value}</div><div class="card-suit ${card.suit === '♥' || card.suit === '♦' ? 'red' : 'black'}">${card.suit}</div>`;
            }
        });
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
        
        // Resetar informações dos bots
        const bot1InfoElement = document.querySelector('.bot-left .bot-info');
        const bot2InfoElement = document.querySelector('.bot-right .bot-info');
        
        if (bot1InfoElement) {
            bot1InfoElement.textContent = 'Bot 1';
        }
        
        if (bot2InfoElement) {
            bot2InfoElement.textContent = 'Bot 2';
        }
        
        // Remover expressões faciais dos bots se existirem
        const botExpressions = document.querySelectorAll('.bot-expression');
        botExpressions.forEach(expression => {
            expression.remove();
        });
    }
    
    // Inicializar botões
    resetGame();
    updatePokerBetDisplay();
}
