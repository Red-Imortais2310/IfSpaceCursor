// scripts/chat.js
import { 
    saveMessageToFirebase, 
    onAuthStateChange,
    uploadMediaToStorage, 
    updateMessageReaction,
    loadUsersForChat 
} from '../firebase-config.js';
import { doc, getDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { auth, db } from '../firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Variáveis de estado
    let currentFriend = null;
    let currentUserId = null; 
    const usersCache = {};

    // ====== SONS DO CHAT ======
    const somEnviado  = new Audio('sounds/msg_enviada.mp3');
    const somRecebido = new Audio('sounds/msg_recebida.mp3');

    async function getUserDisplayName(uid) {
        if (!uid) return "Usuário";
        if (usersCache[uid]) return usersCache[uid];

        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const name = data.fullName || data.email?.split('@')[0] || "Usuário";
                usersCache[uid] = name;
                return name;
            }
        } catch (e) {
            console.error("Erro ao buscar nome:", e);
        }
        return "Usuário";
    }
    
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

    // ====== FUNÇÃO PARA MARCAR AMIGO ATIVO ======
    function marcarAmigoAtivo(friendId) {
        document.querySelectorAll('.friend-item').forEach(item => {
            item.classList.remove('active-chat');
        });
        const ativo = document.querySelector(`.friend-item[data-id="${friendId}"]`);
        if (ativo) ativo.classList.add('active-chat');
    }

    // ====== INICIALIZAÇÃO ======
    function init() {
        onAuthStateChange(async (user) => {
            if (user) {
                currentUserId = user.uid;
                console.log("Usuário autenticado no chat:", currentUserId);
                await loadFriends(currentUserId);
                setupEventListeners();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // ====== CARREGAR AMIGOS ======
async function loadFriends(userId) {
    friendsList.innerHTML = '<li style="padding:15px;text-align:center;">Carregando...</li>';
    const realUsers = await loadUsersForChat(userId);

    friendsList.innerHTML = '';
    for (const friend of realUsers) {
        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(userId, friend.id);
        const chatDocRef = doc(db, "chats", chatId);

        const el = document.createElement('li');
        el.className = 'friend-item';
        el.dataset.id = friend.id;
        el.innerHTML = `
            <img src="${friend.avatar}" class="friend-avatar">
            <div class="friend-info">
                <div class="friend-name">${friend.name}</div>
                <div class="friend-status">Online</div>
            </div>
            <span class="unread-badge" style="display:none;">0</span>
        `;

        // Listener em tempo real do contador de não lidas
        onSnapshot(chatDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.unreadFor === userId) {
                    const badge = el.querySelector('.unread-badge');
                    badge.style.display = 'flex';
                    badge.textContent = '●'; // bolinha piscando
                    el.classList.add('active-chat');
                } else {
                    el.querySelector('.unread-badge').style.display = 'none';
                    if (currentFriend?.id !== friend.id) el.classList.remove('active-chat');
                }
            }
        });

        el.addEventListener('click', () => {
            currentFriend = friend;
            updateChatHeader(friend);
            loadMessages(friend.id);
            el.classList.add('active');
            document.querySelectorAll('.friend-item').forEach(i => {
                if (i !== el) i.classList.remove('active');
            });
        });

        friendsList.appendChild(el);
    }
}

    // ====== ATUALIZAR CABEÇALHO DO CHAT ======
    function updateChatHeader(friend) {
        chatHeader.innerHTML = `
            <img src="${friend.avatar}" alt="${friend.name}" class="header-avatar">
            <div class="user-details">
                <h3>${friend.name}</h3>
                <span>${friend.status}</span>
            </div>
        `;
    }

    // ====== ENVIAR MENSAGEM ======
    async function sendMessage(type = 'text', mediaUrl = null) {
        if (!currentFriend || (!messageInput.value.trim() && type === 'text')) return;

        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(currentUserId, currentFriend.id);

        try {
            await saveMessageToFirebase({
                chatId: chatId,
                senderId: currentUserId,
                text: type === 'text' ? messageInput.value : null,
                type: type,
                mediaUrl: mediaUrl || null,
                timestamp: serverTimestamp()
            });

            somEnviado.play();
            if (type === 'text') messageInput.value = '';
        } catch (e) {
            console.error("Erro ao enviar:", e);
            alert("Erro ao enviar mensagem");
        }
    }

    // ====== CARREGAR MENSAGENS COM SOM DE RECEBIMENTO ======
    function loadMessages(friendId) {
        const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
        const chatId = getChatId(currentUserId, friendId);

        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp"));

        return onSnapshot(q, (snapshot) => {
            // Marcar todas as mensagens como lidas quando abrir o chat
const markAsRead = async () => {
    const getChatId = (id1, id2) => id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
    const chatId = getChatId(currentUserId, friendId);
    const chatDocRef = doc(db, "chats", chatId);

    await setDoc(chatDocRef, {
        unreadFor: currentUserId  // agora quem não leu sou eu? Não, limpa!
    }, { merge: true });

    // Opcional: marca todas as mensagens como lidas
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, where("read", "==", false), where("senderId", "!=", currentUserId));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach(doc => batch.update(doc.ref, { read: true }));
    await batch.commit();
};
markAsRead(); // ← executa ao abrir o chat
            chatMessages.innerHTML = "";
            let temNova = false;

            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const msg = change.doc.data();
                    msg.id = change.doc.id;
                    if (msg.senderId !== currentUserId) temNova = true;

                    const el = createMessageElement(msg);
                    chatMessages.appendChild(el);
                }
            });

            if (temNova && !document.hidden) {
                somRecebido.play().catch(() => {});
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // ====== FUNÇÃO createMessageElement (deixe exatamente como está) ======
    function createMessageElement(message) {
        const messageDiv = document.createElement('div');
        const senderType = message.senderId === currentUserId ? 'sent' : 'received';
        messageDiv.className = `message ${senderType}`;
        messageDiv.dataset.messageId = message.id;

        let avatarHtml = '';
        if (senderType === 'received' && currentFriend) {
            avatarHtml = `
                <div class="message-avatar-container">
                    <img src="${currentFriend.avatar}" alt="${currentFriend.name}" class="message-avatar">
                    <div class="sender-name-in-message">${currentFriend.name}</div>
                </div>
            `;
        }

        let contentHtml = '';
        if (message.type === 'text') {
            contentHtml = `<div class="message-content">${message.text}</div>`;
        } else if (message.type === 'image' && message.mediaUrl) {
            contentHtml = `<div class="message-content"><img src="${message.mediaUrl}" loading="lazy"></div>`;
        } else if (message.type === 'audio' && message.mediaUrl) {
            contentHtml = `<div class="message-content"><audio controls src="${message.mediaUrl}"></audio></div>`;
        }

        let reactionHtml = message.reaction ? `<span class="reaction-emoji">${message.reaction}</span>` : '';

        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="message-bubble-wrapper">
                ${contentHtml}
                <div class="message-time">${new Date(message.timestamp?.toDate()).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
            ${reactionHtml}
        `;

        // Reações (seu código antigo continua aqui)
        // ... seu código de reação ...

        return messageDiv;
    }

    // ====== EVENTOS ======
    function setupEventListeners() {
        sendBtn.addEventListener('click', () => sendMessage('text'));
        messageInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage('text');
            }
        });
        uploadMediaBtn.addEventListener('click', () => mediaUploadInput.click());
        mediaUploadInput.addEventListener('change', e => {
            if (e.target.files[0]) handleMediaUpload(e.target.files[0]);
        });
    }

    async function handleMediaUpload(file) {
        // seu código de upload (deixe como está)
    }

    init();
});
