// Função para carregar e exibir usuários
function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('users-table-body');
            tableBody.innerHTML = '';
            data.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.password}</td>
                    <td>R$ ${user.balance.toFixed(2)}</td>
                    <td>${user.status}</td>
                    <td>
                        <button class='btn-secondary' onclick='editUser("${user.id}")'>Editar</button>
                        <button class='btn-danger' onclick='deleteUser("${user.id}")'>Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
}

// Função para editar usuário
function editUser(userId) {
    // Implementar lógica de edição
}

// Função para excluir usuário
function deleteUser(userId) {
    // Implementar lógica de exclusão
}

// Carregar usuários ao abrir a página
loadUsers();