// Dados de usuário simulados (para desenvolvimento)
let users = JSON.parse(localStorage.getItem('vlad_bet_users')) || [
    {
        username: 'admin',
        email: 'admin@vladbet.com',
        password: 'admin123',
        balance: 10000,
        isAdmin: true,
        status: 'active'
    }
];

// Dados de apostas personalizadas simulados
let customBets = JSON.parse(localStorage.getItem('vlad_bet_custom_bets')) || [];

// Usuário atual
let currentUser = JSON.parse(localStorage.getItem('vlad_bet_current_user')) || null;

// Elementos DOM
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const adminPanel = document.getElementById('admin-panel');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Salvar dados iniciais se não existirem
    if (!localStorage.getItem('vlad_bet_users')) {
        localStorage.setItem('vlad_bet_users', JSON.stringify(users));
    }
    
    if (!localStorage.getItem('vlad_bet_custom_bets')) {
        localStorage.setItem('vlad_bet_custom_bets', JSON.stringify(customBets));
    }
    
    // Verificar se há um usuário logado
    if (currentUser) {
        showApp();
        updateUserInfo();
    } else {
        showAuth();
    }
    
    // Inicializar eventos
    initAuthEvents();
    initNavEvents();
    initSlotMachine();
    initPokerGame();
    initAdminPanel();
    loadCustomBets();
});

// Funções de autenticação
function initAuthEvents() {
    // Alternar entre abas de login e registro
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Atualizar botões de abas
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Atualizar conteúdo das abas
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Formulário de login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Verificar credenciais
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            if (user.status === 'banned') {
                alert('Sua conta foi banida. Entre em contato com o suporte.');
                return;
            }
            
            // Login bem-sucedido
            currentUser = user;
            localStorage.setItem('vlad_bet_current_user', JSON.stringify(user));
            
            if (user.isAdmin) {
                showAdminPanel();
            } else {
                showApp();
            }
            
            updateUserInfo();
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });
    
    // Formulário de registro
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        // Verificar se o usuário já existe
        if (users.some(u => u.username === username)) {
            alert('Este nome de usuário já está em uso!');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            alert('Este email já está em uso!');
            return;
        }
        
        // Criar novo usuário
        const newUser = {
            username,
            email,
            password,
            balance: 100, // Saldo inicial
            isAdmin: false,
            status: 'active'
        };
        
        users.push(newUser);
        localStorage.setItem('vlad_bet_users', JSON.stringify(users));
        
        // Login automático
        currentUser = newUser;
        localStorage.setItem('vlad_bet_current_user', JSON.stringify(newUser));
        
        showApp();
        updateUserInfo();
        
        alert('Registro concluído com sucesso! Você recebeu R$ 100,00 de bônus de boas-vindas.');
    });
    
    // Logout
    const logoutLink = document.getElementById('logout-link');
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Admin logout
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    adminLogoutBtn.addEventListener('click', () => {
        logout();
    });
    
    // Voltar ao site (do painel admin)
    const adminBackBtn = document.getElementById('admin-back-btn');
    adminBackBtn.addEventListener('click', () => {
        showApp();
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('vlad_bet_current_user');
    showAuth();
}

function showAuth() {
    authContainer.classList.add('active');
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    adminPanel.classList.add('hidden');
}

function showApp() {
    authContainer.classList.remove('active');
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    
    // Mostrar seção inicial
    showSection('home');
}

function showAdminPanel() {
    authContainer.classList.remove('active');
    authContainer.classList.add('hidden');
    appContainer.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    
    // Carregar dados do admin panel
    loadAdminUsers();
    loadAdminCustomBets();
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('username-display').textContent = currentUser.username;
        document.getElementById('user-balance').textContent = `R$ ${currentUser.balance.toFixed(2)}`;
    }
}

function updateUserInStorage() {
    // Atualizar usuário no localStorage
    localStorage.setItem('vlad_bet_current_user', JSON.stringify(currentUser));
    
    // Atualizar usuário na lista de usuários
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('vlad_bet_users', JSON.stringify(users));
    }
}

// Navegação
function initNavEvents() {
    // Navegação principal
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Cards de categoria na home
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const sectionId = card.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Navegação do painel admin
    const adminNavLinks = document.querySelectorAll('.admin-nav-link');
    adminNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showAdminSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Atualizar links de navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Atualizar seções
    document.querySelectorAll('main .section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Carregar dados específicos da seção
    if (sectionId === 'custom-bets') {
        loadCustomBets();
    }
}

function showAdminSection(sectionId) {
    // Atualizar links de navegação
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Atualizar seções
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Caça-níqueis
function initSlotMachine() {
    const symbols = ['🍒', '🍋', '🍇', '🍊', '🍉', '💎', '7️⃣'];
    const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    const spinButton = document.getElementById('spin-button');
    const decreaseBetBtn = document.getElementById('decrease-bet');
    const increaseBetBtn = document.getElementById('increase-bet');
    const currentBetDisplay = document.getElementById('current-bet');
    const slotResult = document.getElementById('slot-result');
    
    let currentBet = 5;
    let isSpinning = false;
    
    // Atualizar exibição da aposta
    function updateBetDisplay() {
        currentBetDisplay.textContent = `R$ ${currentBet.toFixed(2)}`;
    }
    
    // Diminuir aposta
    decreaseBetBtn.addEventListener('click', () => {
        if (isSpinning) return;
        if (currentBet > 1) {
            currentBet -= 1;
            updateBetDisplay();
        }
    });
    
    // Aumentar aposta
    increaseBetBtn.addEventListener('click', () => {
        if (isSpinning) return;
        if (currentBet < 100) {
            currentBet += 1;
            updateBetDisplay();
        }
    });
    
    // Girar caça-níqueis
    spinButton.addEventListener('click', () => {
        if (isSpinning) return;
        
        // Verificar saldo
        if (currentUser.balance < currentBet) {
            alert('Saldo insuficiente!');
            return;
        }
        
        // Deduzir aposta do saldo
        currentUser.balance -= currentBet;
        updateUserInfo();
        updateUserInStorage();
        
        isSpinning = true;
        spinButton.disabled = true;
        slotResult.classList.add('hidden');
        
        // Remover classes de vitória anteriores
        reels.forEach(reel => {
            reel.classList.remove('win');
            const symbols = reel.querySelectorAll('.slot-symbol');
            symbols.forEach(symbol => symbol.classList.remove('win'));
        });
        
        // Animação de giro
        const spinResults = [];
        const spinSounds = ['spin1', 'spin2', 'spin3'];
        
        // Reproduzir som de giro
        const spinSound = new Audio(`sounds/${spinSounds[Math.floor(Math.random() * spinSounds.length)]}.mp3`);
        spinSound.volume = 0.3;
        spinSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        
        reels.forEach((reel, reelIndex) => {
            // Criar elementos para animação
            reel.innerHTML = '';
            
            // Adicionar símbolos aleatórios para animação
            for (let i = 0; i < 20; i++) {
                const symbolDiv = document.createElement('div');
                symbolDiv.className = 'slot-symbol spinning';
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                symbolDiv.textContent = randomSymbol;
                symbolDiv.setAttribute('data-symbol', randomSymbol);
                symbolDiv.style.animationDelay = `${i * 0.05}s`;
                reel.appendChild(symbolDiv);
            }
            
            // Resultado final (aleatório)
            const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            spinResults.push(finalSymbol);
            
            // Animar reel com atraso baseado no índice
            setTimeout(() => {
                // Reproduzir som de parada
                const stopSound = new Audio('sounds/reel-stop.mp3');
                stopSound.volume = 0.2;
                stopSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
                
                // Limpar reel e mostrar resultado final
                reel.innerHTML = '';
                const finalSymbolDiv = document.createElement('div');
                finalSymbolDiv.className = 'slot-symbol';
                finalSymbolDiv.textContent = finalSymbol;
                finalSymbolDiv.setAttribute('data-symbol', finalSymbol);
                reel.appendChild(finalSymbolDiv);
                
                // Adicionar efeito de tremor ao parar
                reel.classList.add('shake');
                setTimeout(() => reel.classList.remove('shake'), 200);
                
                // Verificar se é o último reel
                if (reelIndex === reels.length - 1) {
                    setTimeout(() => {
                        checkSlotWin(spinResults);
                        isSpinning = false;
                        spinButton.disabled = false;
                    }, 500);
                }
            }, 1000 + (reelIndex * 500));
        });
    });
    
    // Verificar vitória
    function checkSlotWin(results) {
        let winAmount = 0;
        slotResult.classList.remove('win', 'lose');
        
        // Verificar combinações
        if (results[0] === results[1] && results[1] === results[2]) {
            // Três iguais
            const symbol = results[0];
            let multiplier = 0;
            
            switch (symbol) {
                case '7️⃣': multiplier = 50; break;
                case '💎': multiplier = 20; break;
                case '🍉': multiplier = 15; break;
                case '🍊': multiplier = 10; break;
                case '🍇': multiplier = 8; break;
                case '🍋': multiplier = 5; break;
                case '🍒': multiplier = 3; break;
                default: multiplier = 2;
            }
            
            winAmount = currentBet * multiplier;
            slotResult.textContent = `Você ganhou R$ ${winAmount.toFixed(2)}!`;
            slotResult.classList.add('win');
            
            // Animação de vitória para todos os reels
            reels.forEach((reel, index) => {
                reel.classList.add('win');
                const symbol = reel.querySelector('.slot-symbol');
                if (symbol) symbol.classList.add('win');
            });
            
            // Reproduzir som de vitória grande
            const winSound = new Audio('sounds/big-win.mp3');
            winSound.volume = 0.5;
            winSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            
            // Adicionar efeito de confete para grandes vitórias
            if (multiplier >= 10) {
                showConfetti();
            }
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            // Dois iguais
            winAmount = currentBet * 1.5;
            slotResult.textContent = `Você ganhou R$ ${winAmount.toFixed(2)}!`;
            slotResult.classList.add('win');
            
            // Identificar quais reels têm símbolos iguais
            if (results[0] === results[1]) {
                reels[0].classList.add('win');
                reels[1].classList.add('win');
                reels[0].querySelector('.slot-symbol').classList.add('win');
                reels[1].querySelector('.slot-symbol').classList.add('win');
            } else if (results[1] === results[2]) {
                reels[1].classList.add('win');
                reels[2].classList.add('win');
                reels[1].querySelector('.slot-symbol').classList.add('win');
                reels[2].querySelector('.slot-symbol').classList.add('win');
            } else if (results[0] === results[2]) {
                reels[0].classList.add('win');
                reels[2].classList.add('win');
                reels[0].querySelector('.slot-symbol').classList.add('win');
                reels[2].querySelector('.slot-symbol').classList.add('win');
            }
            
            // Reproduzir som de vitória pequena
            const winSound = new Audio('sounds/small-win.mp3');
            winSound.volume = 0.4;
            winSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
        } else {
            // Sem combinação
            slotResult.textContent = `Você perdeu R$ ${currentBet.toFixed(2)}!`;
            slotResult.classList.add('lose');
            
            // Reproduzir som de derrota
            const loseSound = new Audio('sounds/lose.mp3');
            loseSound.volume = 0.3;
            loseSound.play().catch(e => console.log('Erro ao reproduzir som:', e));
            return;
        }
        
        // Adicionar ganhos ao saldo
        currentUser.balance += winAmount;
        updateUserInfo();
        updateUserInStorage();
    }
    
    // Função para mostrar confete na tela
    function showConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        // Criar 50 pedaços de confete
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = getRandomColor();
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confettiContainer.appendChild(confetti);
        }
        
        // Remover o confete após 5 segundos
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
    }
    
    // Função para gerar cores aleatórias
    function getRandomColor() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        return colors[Math.floor(Math.random() * colors.length)];
    }}