document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const friendsList = document.getElementById('friendsList');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHeader = document.querySelector('.chat-header .chat-user-info');

    // Lista de 50 amigos
    const friends = [
        { id: 1, name: 'Maria Silva', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Oi! Como você está?', time: '2 min' },
        { id: 2, name: 'João Santos', status: 'Há 5 min', avatar: 'https://via.placeholder.com/45', lastMessage: 'Vamos sair hoje?', time: '5 min' },
        { id: 3, name: 'Ana Costa', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Obrigada pela ajuda!', time: '10 min' },
        { id: 4, name: 'Pedro Oliveira', status: 'Há 15 min', avatar: 'https://via.placeholder.com/45', lastMessage: 'Até logo!', time: '15 min' },
        { id: 5, name: 'Carla Lima', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Que dia lindo!', time: '20 min' },
        { id: 6, name: 'Rafael Souza', status: 'Há 30 min', avatar: 'https://via.placeholder.com/45', lastMessage: 'Vou chegar atrasado', time: '30 min' },
        { id: 7, name: 'Fernanda Rocha', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Perfeito!', time: '1 hora' },
        { id: 8, name: 'Lucas Alves', status: 'Há 2 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Boa noite!', time: '2 horas' },
        { id: 9, name: 'Juliana Ferreira', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Nos vemos amanhã', time: '3 horas' },
        { id: 10, name: 'Diego Martins', status: 'Há 4 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Obrigado!', time: '4 horas' },
        { id: 11, name: 'Patricia Gomes', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Que bom!', time: '5 horas' },
        { id: 12, name: 'Marcos Silva', status: 'Há 6 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Até mais!', time: '6 horas' },
        { id: 13, name: 'Camila Dias', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Legal!', time: '7 horas' },
        { id: 14, name: 'Thiago Costa', status: 'Há 8 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Valeu!', time: '8 horas' },
        { id: 15, name: 'Larissa Santos', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Beleza!', time: '9 horas' },
        { id: 16, name: 'Bruno Lima', status: 'Há 10 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Tudo bem!', time: '10 horas' },
        { id: 17, name: 'Gabriela Souza', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Perfeito!', time: '11 horas' },
        { id: 18, name: 'Felipe Rocha', status: 'Há 12 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Ótimo!', time: '12 horas' },
        { id: 19, name: 'Isabela Alves', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Show!', time: '13 horas' },
        { id: 20, name: 'André Ferreira', status: 'Há 14 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Legal!', time: '14 horas' },
        { id: 21, name: 'Beatriz Martins', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Bacana!', time: '15 horas' },
        { id: 22, name: 'Carlos Gomes', status: 'Há 16 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Massa!', time: '16 horas' },
        { id: 23, name: 'Daniela Silva', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Incrível!', time: '17 horas' },
        { id: 24, name: 'Eduardo Costa', status: 'Há 18 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Fantástico!', time: '18 horas' },
        { id: 25, name: 'Fabiana Lima', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Maravilhoso!', time: '19 horas' },
        { id: 26, name: 'Gustavo Souza', status: 'Há 20 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Sensacional!', time: '20 horas' },
        { id: 27, name: 'Helena Rocha', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Espetacular!', time: '21 horas' },
        { id: 28, name: 'Igor Alves', status: 'Há 22 horas', avatar: 'https://via.placeholder.com/45', lastMessage: 'Fantástico!', time: '22 horas' },
        { id: 29, name: 'Julia Ferreira', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Incrível!', time: '23 horas' },
        { id: 30, name: 'Kleber Martins', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Perfeito!', time: '1 dia' },
        { id: 31, name: 'Luciana Gomes', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Ótimo!', time: '1 dia' },
        { id: 32, name: 'Mateus Silva', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Show!', time: '1 dia' },
        { id: 33, name: 'Natália Costa', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Legal!', time: '1 dia' },
        { id: 34, name: 'Otávio Lima', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Bacana!', time: '1 dia' },
        { id: 35, name: 'Paula Souza', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Massa!', time: '1 dia' },
        { id: 36, name: 'Quirino Rocha', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Incrível!', time: '1 dia' },
        { id: 37, name: 'Renata Alves', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Fantástico!', time: '1 dia' },
        { id: 38, name: 'Sérgio Ferreira', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Maravilhoso!', time: '1 dia' },
        { id: 39, name: 'Tatiana Martins', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Sensacional!', time: '1 dia' },
        { id: 40, name: 'Ubirajara Gomes', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Espetacular!', time: '1 dia' },
        { id: 41, name: 'Valéria Silva', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Fantástico!', time: '1 dia' },
        { id: 42, name: 'Wagner Costa', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Incrível!', time: '1 dia' },
        { id: 43, name: 'Ximena Lima', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Perfeito!', time: '1 dia' },
        { id: 44, name: 'Yuri Souza', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Ótimo!', time: '1 dia' },
        { id: 45, name: 'Zélia Rocha', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Show!', time: '1 dia' },
        { id: 46, name: 'Alex Alves', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Legal!', time: '1 dia' },
        { id: 47, name: 'Bianca Ferreira', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Bacana!', time: '1 dia' },
        { id: 48, name: 'César Martins', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Massa!', time: '1 dia' },
        { id: 49, name: 'Débora Gomes', status: 'Online', avatar: 'https://via.placeholder.com/45', lastMessage: 'Incrível!', time: '1 dia' },
        { id: 50, name: 'Emanuel Silva', status: 'Há 1 dia', avatar: 'https://via.placeholder.com/45', lastMessage: 'Fantástico!', time: '1 dia' }
    ];

    // Mensajes de ejemplo para cada amigo
    const sampleMessages = {
        1: [
            { text: 'Oi! Como você está?', sender: 'friend', time: '14:30' },
            { text: 'Oi Maria! Estou bem, obrigado! E você?', sender: 'me', time: '14:32' },
            { text: 'Também estou ótima! Que bom te ver por aqui', sender: 'friend', time: '14:33' }
        ],
        2: [
            { text: 'Vamos sair hoje?', sender: 'friend', time: '13:45' },
            { text: 'Claro! Que horas você quer?', sender: 'me', time: '13:47' }
        ],
        3: [
            { text: 'Obrigada pela ajuda!', sender: 'friend', time: '12:20' },
            { text: 'De nada! Sempre que precisar', sender: 'me', time: '12:22' }
        ]
    };

    let currentFriend = null;

    // Inicializar la página
    init();

    function init() {
        loadFriends();
        setupEventListeners();
    }

    function loadFriends() {
        friendsList.innerHTML = '';
        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-item';
            friendElement.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.name}">
                <div class="friend-info">
                    <div class="friend-name">${friend.name}</div>
                    <div class="friend-status">${friend.status}</div>
                </div>
            `;
            friendElement.addEventListener('click', () => selectFriend(friend));
            friendsList.appendChild(friendElement);
        });
    }

    function selectFriend(friend) {
        // Remover selección anterior
        document.querySelectorAll('.friend-item').forEach(item => {
            item.classList.remove('active');
        });

        // Seleccionar amigo actual
        event.currentTarget.classList.add('active');
        currentFriend = friend;

        // Actualizar header del chat
        updateChatHeader(friend);

        // Cargar mensajes
        loadMessages(friend.id);

        // Mostrar input de mensaje
        chatInput.style.display = 'block';
    }

    function updateChatHeader(friend) {
        const userDetails = chatHeader.querySelector('.user-details');
        userDetails.innerHTML = `
            <h3>${friend.name}</h3>
            <span>${friend.status}</span>
        `;
    }

    function loadMessages(friendId) {
        chatMessages.innerHTML = '';
        
        const messages = sampleMessages[friendId] || [];
        
        if (messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments"></i>
                    <h3>Inicie uma conversa</h3>
                    <p>Envie uma mensagem para ${friends.find(f => f.id === friendId)?.name}</p>
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });

        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'me' ? 'sent' : 'received'}`;
        
        if (message.sender === 'me') {
            messageDiv.innerHTML = `
                <div class="message-content">${message.text}</div>
                <div class="message-time">${message.time}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <img src="${currentFriend.avatar}" alt="${currentFriend.name}" class="message-avatar">
                <div class="message-content">${message.text}</div>
                <div class="message-time">${message.time}</div>
            `;
        }
        
        return messageDiv;
    }

    function setupEventListeners() {
        // Enviar mensaje
        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    function sendMessage() {
        if (!currentFriend) {
            alert('Selecione um amigo para enviar mensagem');
            return;
        }

        const messageText = messageInput.value.trim();
        if (!messageText) return;

        // Crear mensaje
        const newMessage = {
            text: messageText,
            sender: 'me',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        // Agregar mensaje al chat
        const messageElement = createMessageElement(newMessage);
        chatMessages.appendChild(messageElement);

        // Limpiar input
        messageInput.value = '';

        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simular respuesta automática después de 2 segundos
        setTimeout(() => {
            if (Math.random() > 0.5) { // 50% de probabilidad de respuesta
                const responses = [
                    'Interessante!',
                    'Concordo!',
                    'Realmente!',
                    'Que legal!',
                    'Ótimo!',
                    'Perfeito!',
                    'Show!',
                    'Massa!'
                ];
                
                const autoResponse = {
                    text: responses[Math.floor(Math.random() * responses.length)],
                    sender: 'friend',
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                };

                const responseElement = createMessageElement(autoResponse);
                chatMessages.appendChild(responseElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 2000);
    }
});
