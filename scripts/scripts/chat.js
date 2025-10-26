// scripts/chat.js

// CORREÇÃO: Usa ./ para procurar o arquivo na MESMA pasta (/scripts)
import { 
    saveMessageToFirebase, 
    onAuthStateChange,
    uploadMediaToStorage, 
    updateMessageReaction,
    loadUsersForChat 
} from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Variáveis de estado
    let currentFriend = null;
    let currentUserId = null; 
    
    // Elementos do DOM
    const friendsList = document.getElementById('friendsList');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatHeader = document.querySelector('.chat-header .chat-user-info');
    const uploadMediaBtn = document.getElementById('uploadMediaBtn');
    const mediaUploadInput = document.getElementById('mediaUploadInput');
    const emojiBtn = document.getElementById('emojiBtn');

    // Inicializar a página
    init();

    function init() {
        // ESSA É A PARTE CRÍTICA: Espera o usuário logar para obter o UID
        onAuthStateChange(async (user) => {
            if (user) {
                currentUserId = user.uid; // Define o ID real
                console.log("Usuário autenticado:", currentUserId);
                
                // Carrega a lista de amigos REAL!
                await loadFriends(currentUserId); 
                setupEventListeners();
            } else {
                currentUserId = null; 
                console.log("Nenhum usuário logado. Redirecionando...");
                // **Opcional: Redirecionar para login**
                // window.location.href = 'login.html'; 
            }
        });
    }

    // --- LÓGICA DE INTERFACE DE AMIGOS (AGORA REAL) ---

    // FUNÇÃO REVISADA: Carrega usuários reais do Firestore
    async function loadFriends(userId) {
        friendsList.innerHTML = '';
        
        // CHAMA A FUNÇÃO REAL DO FIREBASE
        const realUsers = await loadUsersForChat(userId); 

        if (realUsers.length === 0) {
            friendsList.innerHTML = `<li style="padding: 15px; text-align: center;">Nenhum outro usuário cadastrado encontrado.</li>`;
            return;
        }

        realUsers.forEach(friend => {
            const friendElement = document.createElement('li'); 
            friendElement.className = 'friend-item';
            friendElement.dataset.id = friend.id; // ID real do Firestore (UID)
            friendElement.innerHTML = `
                <img src="${friend.avatar}" alt="${friend.name}" class="friend-avatar">
                <div class="friend-info">
                    <div class="friend-name">${friend.name}</div>
                    <div class="friend-status">${friend.status}</div>
                </div>
            `;
            
            // Lógica de Clique: Seleciona o amigo e carrega o chat
            friendElement.addEventListener('click', function(e) {
                // Remove seleção anterior
                document.querySelectorAll('.friend-item').forEach(item => {
                    item.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
                
                currentFriend = friend;
                
                updateChatHeader(friend);
                loadMessages(friend.id); // Usando o ID real para carregar a conversa
                chatInput.style.display = 'flex'; 
            });
            
            friendsList.appendChild(friendElement);
        });
    }
    
    function updateChatHeader(friend) {
        const userDetails = chatHeader.querySelector('.user-details');
        
        // Limpeza de avatares (para evitar duplicidade)
        const existingAvatar = chatHeader.querySelector('.message-avatar');
        if(existingAvatar) existingAvatar.remove();
        
        const defaultAvatar = chatHeader.querySelector('.default-avatar');
        if(defaultAvatar) defaultAvatar.remove();
        
        // Adiciona o novo avatar/placeholder
        chatHeader.insertAdjacentHTML('afterbegin', `<img src="${friend.avatar}" alt="${friend.name}" class="message-avatar">`);

        userDetails.innerHTML = `
            <h3>${friend.name}</h3>
            <span>${friend.status}</span>
        `;
    }

    // --- LÓGICA DE CARREGAMENTO E RENDERIZAÇÃO DE MENSAGENS ---
    
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        const senderType = message.senderId === currentUserId ? 'sent' : 'received';
        
        messageDiv.className = `message ${senderType}`;
        messageDiv.dataset.messageId = message.id; 
        
        let contentHtml = '';

        if (message.type === 'text') {
            contentHtml = `<div class="message-content">${message.text}</div>`;
        } else if (message.type === 'image' && message.mediaUrl) {
            contentHtml = `<div class="message-content"><img src="${message.mediaUrl}" alt="Imagem Enviada" loading="lazy"></div>`;
        } else if (message.type === 'audio' && message.mediaUrl) {
            contentHtml = `<div class="message-content"><audio controls src="${message.mediaUrl}"></audio></div>`;
        } else {
            contentHtml = `<div class="message-content">${message.text || `[${message.type.toUpperCase()}]`}</div>`;
        }

        let avatarHtml = '';
        if (senderType === 'received' && currentFriend) {
            avatarHtml = `<img src="${currentFriend.avatar}" alt="${currentFriend.name}" class="message-avatar">`;
        }
        
        let reactionHtml = '';
        if (message.reaction) {
            reactionHtml = `<span class="reaction-emoji" data-message-id="${message.id}">${message.reaction}</span>`;
        }

        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="message-bubble-wrapper">
                ${contentHtml}
                <div class="message-time">${message.time}</div>
            </div>
            ${reactionHtml}
            
            <div class="like-icon-container">
                <div class="reaction-menu">
                    <span data-emoji="👍">👍</span>
                    <span data-emoji="❤️">❤️</span>
                    <span data-emoji="😂">😂</span>
                    <span data-emoji="😢">😢</span>
                    <span data-emoji="😮">😮</span>
                </div>
            </div>
        `;

        // Adiciona o listener para exibir o menu de reação
        const reactionMenu = messageDiv.querySelector('.reaction-menu');
        if (reactionMenu) {
            reactionMenu.querySelectorAll('span').forEach(span => {
                span.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    handleReaction(message.id, e.currentTarget.dataset.emoji);
                    messageDiv.querySelector('.like-icon-container').style.display = 'none'; 
                });
            });
        }
        
        return messageDiv;
    }


    function loadMessages(friendId) {
        chatMessages.innerHTML = '';
        
        // ESTE É O LOCAL ONDE VOCÊ INTEGRARÁ O LISTENER DO FIREBASE (onMessagesChange)
        
        const messages = []; // Seus messages reais virão do onSnapshot/onMessagesChange
        
        if (messages.length === 0) {
            // Se não houver mensagens, mostra a mensagem de boas-vindas
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments"></i>
                    <h3>Converse com ${currentFriend.name}</h3>
                    <p>Comece a digitar abaixo para iniciar a conversa.</p>
                </div>
            `;
            return;
        }

        messages.forEach(message => {
            const messageElement = createMessageElement(message);
            chatMessages.appendChild(messageElement);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // --- LÓGICA DE AÇÕES DO CHAT (ENVIAR/MÍDIA/REAÇÃO) ---

    async function sendMessage(type = 'text', mediaUrl = null) {
        if (!currentFriend || !currentUserId) {
            alert('Selecione um amigo e faça login para enviar mensagem');
            return;
        }

        const messageText = messageInput.value.trim();
        if (!messageText && !mediaUrl) return;

        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(currentUserId, currentFriend.id); 

        const newMessage = {
            id: 'temp_' + Date.now(), 
            text: messageText,
            senderId: currentUserId, 
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            chatId: chatId, 
            type: type, 
            mediaUrl: mediaUrl,
            reaction: null,
        };

        try {
            // Salvar mensagem no Firebase
            const result = await saveMessageToFirebase(newMessage); 
            
            // Adicionar mensagem na UI (Simulando o onSnapshot/onMessagesChange)
            const messageElement = createMessageElement(newMessage);
            chatMessages.appendChild(messageElement);

            if (type === 'text') {
                messageInput.value = '';
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem');
        }
    }
    
    async function handleMediaUpload(file) {
        if (!currentFriend) {
             alert('Selecione um amigo para enviar mídia');
             return;
        }
        
        const type = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('audio/') ? 'audio' : 'file');
        messageInput.placeholder = `Carregando ${type === 'image' ? 'imagem' : 'áudio'}...`;
        messageInput.disabled = true;
        
        try {
            const mediaUrl = await uploadMediaToStorage(file, `chats/${currentFriend.id}`);
            
            if (mediaUrl) {
                await sendMessage(type, mediaUrl);
            } else {
                alert('Falha ao obter URL da mídia.');
            }
        } catch (error) {
            console.error('Erro no upload de mídia:', error);
            alert(`Erro ao enviar ${type}: ${error.message}`);
        } finally {
            messageInput.placeholder = "Escreva sua mensagem...";
            messageInput.disabled = false;
            mediaUploadInput.value = ''; 
        }
    }
    
    async function handleReaction(messageId, emoji) {
        if (!currentFriend) return;
        
        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(currentUserId, currentFriend.id); 

        try {
            await updateMessageReaction(chatId, messageId, emoji);
            
            // Atualizar a UI localmente (Simulação)
            const messageElement = chatMessages.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                let existingReaction = messageElement.querySelector('.reaction-emoji');
                if (!existingReaction) {
                    existingReaction = document.createElement('span');
                    existingReaction.className = 'reaction-emoji';
                    messageElement.appendChild(existingReaction);
                }
                existingReaction.textContent = emoji;
            }
            
        } catch (error) {
            console.error('Erro ao enviar reação:', error);
        }
    }

    // --- CONFIGURAÇÃO DE LISTENERS ---

    function setupEventListeners() {
        sendBtn.addEventListener('click', () => sendMessage('text'));
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage('text');
            }
        });
        
        uploadMediaBtn.addEventListener('click', () => {
            mediaUploadInput.click();
        });
        
        mediaUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleMediaUpload(file);
            }
        });
        
        emojiBtn.addEventListener('click', () => {
             messageInput.value += '😊'; 
        });
    }

});
