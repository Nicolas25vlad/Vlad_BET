// Admin Panel Logic

// Inicializar painel de administração
function initAdminPanel() {
    // Elementos DOM
    const userSearchInput = document.getElementById('user-search');
    const userSearchBtn = document.getElementById('user-search-btn');
    const usersTableBody = document.getElementById('users-table-body');
    const userEditPanel = document.getElementById('user-edit-panel');
    const editUsername = document.getElementById('edit-username');
    const editBalance = document.getElementById('edit-balance');
    const editStatus = document.getElementById('edit-status');
    const saveUserBtn = document.getElementById('save-user-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    const customBetsTableBody = document.getElementById('custom-bets-table-body');
    const addCustomBetBtn = document.getElementById('add-custom-bet-btn');
    const customBetEditPanel = document.getElementById('custom-bet-edit-panel');
    const customBetFormTitle = document.getElementById('custom-bet-form-title');
    const customBetForm = document.getElementById('custom-bet-form');
    const betTitle = document.getElementById('bet-title');
    const betDescription = document.getElementById('bet-description');
    const betOptionsContainer = document.getElementById('bet-options-container');
    
    let editingUser = null;
    let editingBet = null;
    
    // Carregar usuários
    function loadAdminUsers() {
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>R$ ${user.balance.toFixed(2)}</td>
                <td>${user.status === 'active' ? 'Ativo' : 'Banido'}</td>
                <td>
                    <button class="edit-user-btn btn-secondary" data-username="${user.username}">Editar</button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Adicionar event listeners para botões de edição
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.getAttribute('data-username');
                editUser(username);
            });
        });
    }
    
    // Editar usuário
    function editUser(username) {
        editingUser = users.find(u => u.username === username);
        
        if (editingUser) {
            editUsername.textContent = editingUser.username;
            editBalance.value = editingUser.balance;
            editStatus.value = editingUser.status;
            
            userEditPanel.classList.remove('hidden');
        }
    }
    
    // Salvar edição de usuário
    saveUserBtn.addEventListener('click', () => {
        if (!editingUser) return;
        
        const newBalance = parseFloat(editBalance.value);
        const newStatus = editStatus.value;
        
        if (isNaN(newBalance) || newBalance < 0) {
            alert('Por favor, insira um valor válido para o saldo.');
            return;
        }
        
        // Atualizar usuário
        editingUser.balance = newBalance;
        editingUser.status = newStatus;
        
        // Atualizar localStorage
        localStorage.setItem('vlad_bet_users', JSON.stringify(users));
        
        // Atualizar usuário atual se for o mesmo
        if (currentUser && currentUser.username === editingUser.username) {
            currentUser = editingUser;
            localStorage.setItem('vlad_bet_current_user', JSON.stringify(currentUser));
            updateUserInfo();
        }
        
        // Recarregar tabela
        loadAdminUsers();
        
        // Fechar painel de edição
        userEditPanel.classList.add('hidden');
        editingUser = null;
    });
    
    // Cancelar edição de usuário
    cancelEditBtn.addEventListener('click', () => {
        userEditPanel.classList.add('hidden');
        editingUser = null;
    });
    
    // Pesquisar usuário
    userSearchBtn.addEventListener('click', () => {
        const searchTerm = userSearchInput.value.toLowerCase();
        
        if (!searchTerm) {
            loadAdminUsers();
            return;
        }
        
        const filteredUsers = users.filter(user => 
            user.username.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm)
        );
        
        usersTableBody.innerHTML = '';
        
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>R$ ${user.balance.toFixed(2)}</td>
                <td>${user.status === 'active' ? 'Ativo' : 'Banido'}</td>
                <td>
                    <button class="edit-user-btn btn-secondary" data-username="${user.username}">Editar</button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Adicionar event listeners para botões de edição
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.getAttribute('data-username');
                editUser(username);
            });
        });
    });
    
    // Carregar apostas personalizadas no painel admin
    function loadAdminCustomBets() {
        if (!customBetsTableBody) return;
        
        customBetsTableBody.innerHTML = '';
        
        customBets.forEach((bet, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${bet.title}</td>
                <td>${bet.description.substring(0, 50)}${bet.description.length > 50 ? '...' : ''}</td>
                <td>${bet.options.map(opt => `${opt.name}: ${opt.odds}x`).join(', ')}</td>
                <td>${bet.active ? 'Ativa' : 'Inativa'}</td>
                <td>
                    <button class="edit-bet-btn btn-secondary" data-index="${index}">Editar</button>
                    <button class="delete-bet-btn btn-secondary" data-index="${index}">Excluir</button>
                    <button class="toggle-bet-btn btn-${bet.active ? 'secondary' : 'primary'}" data-index="${index}">${bet.active ? 'Desativar' : 'Ativar'}</button>
                </td>
            `;
            
            customBetsTableBody.appendChild(row);
        });
        
        // Adicionar event listeners para botões
        document.querySelectorAll('.edit-bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                editBet(index);
            });
        });
        
        document.querySelectorAll('.delete-bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                deleteBet(index);
            });
        });
        
        document.querySelectorAll('.toggle-bet-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                toggleBet(index);
            });
        });
    }
    
    // Adicionar nova aposta personalizada
    addCustomBetBtn.addEventListener('click', () => {
        editingBet = null;
        customBetFormTitle.textContent = 'Adicionar Nova Aposta';
        betTitle.value = '';
        betDescription.value = '';
        
        // Limpar opções e adicionar uma opção vazia
        betOptionsContainer.innerHTML = '';
        addBetOption();
        
        customBetEditPanel.classList.remove('hidden');
    });
    
    // Adicionar opção de aposta
    function addBetOption(name = '', odds = 2.0) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'bet-option';
        
        optionDiv.innerHTML = `
            <input type="text" class="bet-option-name" placeholder="Nome da opção" value="${name}" required>
            <input type="number" class="bet-option-odds" placeholder="Odds" min="1" step="0.1" value="${odds}" required>
            <button type="button" class="remove-option-btn btn-secondary">Remover</button>
        `;
        
        betOptionsContainer.appendChild(optionDiv);
        
        // Adicionar event listener para botão de remover
        optionDiv.querySelector('.remove-option-btn').addEventListener('click', function() {
            if (betOptionsContainer.children.length > 1) {
                betOptionsContainer.removeChild(optionDiv);
            }
        });
    }
    
    // Adicionar botão para adicionar opção
    const addOptionBtn = document.createElement('button');
    addOptionBtn.type = 'button';
    addOptionBtn.className = 'btn-primary';
    addOptionBtn.textContent = 'Adicionar Opção';
    addOptionBtn.id = 'add-option-btn';
    
    addOptionBtn.addEventListener('click', () => {
        addBetOption();
    });
    
    if (betOptionsContainer) {
        betOptionsContainer.parentNode.insertBefore(addOptionBtn, betOptionsContainer.nextSibling);
    }
    
    // Editar aposta personalizada
    function editBet(index) {
        editingBet = customBets[index];
        
        if (editingBet) {
            customBetFormTitle.textContent = 'Editar Aposta';
            betTitle.value = editingBet.title;
            betDescription.value = editingBet.description;
            
            // Limpar opções e adicionar as opções existentes
            betOptionsContainer.innerHTML = '';
            
            editingBet.options.forEach(option => {
                addBetOption(option.name, option.odds);
            });
            
            customBetEditPanel.classList.remove('hidden');
        }
    }
    
    // Salvar aposta personalizada
    customBetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = betTitle.value;
        const description = betDescription.value;
        
        // Coletar opções
        const options = [];
        const optionElements = betOptionsContainer.querySelectorAll('.bet-option');
        
        optionElements.forEach(optionEl => {
            const name = optionEl.querySelector('.bet-option-name').value;
            const odds = parseFloat(optionEl.querySelector('.bet-option-odds').value);
            
            if (name && !isNaN(odds) && odds >= 1) {
                options.push({ name, odds });
            }
        });
        
        if (options.length < 2) {
            alert('Por favor, adicione pelo menos duas opções de aposta.');
            return;
        }
        
        if (editingBet) {
            // Atualizar aposta existente
            editingBet.title = title;
            editingBet.description = description;
            editingBet.options = options;
        } else {
            // Criar nova aposta
            const newBet = {
                id: Date.now().toString(),
                title,
                description,
                options,
                active: true,
                createdAt: new Date().toISOString()
            };
            
            customBets.push(newBet);
        }
        
        // Atualizar localStorage
        localStorage.setItem('vlad_bet_custom_bets', JSON.stringify(customBets));
        
        // Recarregar tabela
        loadAdminCustomBets();
        
        // Fechar painel de edição
        customBetEditPanel.classList.add('hidden');
        editingBet = null;
    });
    
    // Excluir aposta personalizada
    function deleteBet(index) {
        if (confirm('Tem certeza que deseja excluir esta aposta?')) {
            customBets.splice(index, 1);
            
            // Atualizar localStorage
            localStorage.setItem('vlad_bet_custom_bets', JSON.stringify(customBets));
            
            // Recarregar tabela
            loadAdminCustomBets();
        }
    }
    
    // Ativar/desativar aposta personalizada
    function toggleBet(index) {
        customBets[index].active = !customBets[index].active;
        
        // Atualizar localStorage
        localStorage.setItem('vlad_bet_custom_bets', JSON.stringify(customBets));
        
        // Recarregar tabela
        loadAdminCustomBets();
    }
}

// Carregar apostas personalizadas na seção de usuário
function loadCustomBets() {
    const customBetsList = document.getElementById('custom-bets-list');
    
    if (!customBetsList) return;
    
    // Filtrar apostas ativas
    const activeBets = customBets.filter(bet => bet.active);
    
    if (activeBets.length === 0) {
        customBetsList.innerHTML = `
            <div class="empty-state">
                <p>Nenhuma aposta personalizada disponível no momento.</p>
            </div>
        `;
        return;
    }
    
    customBetsList.innerHTML = '';
    
    activeBets.forEach(bet => {
        const betCard = document.createElement('div');
        betCard.className = 'custom-bet-card';
        
        let optionsHTML = '';
        
        bet.options.forEach(option => {
            optionsHTML += `
                <div class="bet-option-item">
                    <label>
                        <input type="radio" name="bet-${bet.id}" value="${option.name}" data-odds="${option.odds}">
                        ${option.name} (${option.odds}x)
                    </label>
                </div>
            `;
        });
        
        betCard.innerHTML = `
            <h3>${bet.title}</h3>
            <p>${bet.description}</p>
            <div class="bet-options">
                ${optionsHTML}
            </div>
            <div class="bet-controls">
                <div class="bet-amount-control">
                    <label for="bet-amount-${bet.id}">Valor da aposta:</label>
                    <input type="number" id="bet-amount-${bet.id}" min="1" value="10" step="1">
                </div>
                <button class="place-bet-btn btn-primary" data-bet-id="${bet.id}">Apostar</button>
            </div>
        `;
        
        customBetsList.appendChild(betCard);
    });
    
    // Adicionar event listeners para botões de aposta
    document.querySelectorAll('.place-bet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const betId = btn.getAttribute('data-bet-id');
            const bet = customBets.find(b => b.id === betId);
            
            if (!bet) return;
            
            const selectedOption = document.querySelector(`input[name="bet-${betId}"]:checked`);
            
            if (!selectedOption) {
                alert('Por favor, selecione uma opção para apostar.');
                return;
            }
            
            const betAmount = parseInt(document.getElementById(`bet-amount-${betId}`).value);
            
            if (isNaN(betAmount) || betAmount < 1) {
                alert('Por favor, insira um valor válido para a aposta.');
                return;
            }
            
            // Verificar saldo
            if (currentUser.balance < betAmount) {
                alert('Saldo insuficiente!');
                return;
            }
            
            // Deduzir aposta do saldo
            currentUser.balance -= betAmount;
            updateUserInfo();
            updateUserInStorage();
            
            // Simular resultado (aleatório)
            const options = bet.options;
            const randomIndex = Math.floor(Math.random() * options.length);
            const winningOption = options[randomIndex];
            
            // Verificar se o usuário ganhou
            if (selectedOption.value === winningOption.name) {
                // Usuário ganhou
                const odds = parseFloat(selectedOption.getAttribute('data-odds'));
                const winAmount = betAmount * odds;
                
                currentUser.balance += winAmount;
                updateUserInfo();
                updateUserInStorage();
                
                alert(`Parabéns! Você ganhou R$ ${winAmount.toFixed(2)} com sua aposta em "${selectedOption.value}"!`);
            } else {
                // Usuário perdeu
                alert(`Você perdeu! O resultado foi "${winningOption.name}". Tente novamente!`);
            }
        });
    });
}